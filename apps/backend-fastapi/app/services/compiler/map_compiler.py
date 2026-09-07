"""Real .navpack compiler.

Creates a ZIP archive containing:
  manifest.json   — version, hashes, signature metadata
  map.sqlite      — floors, features, graph, POIs, FTS5 index
  style.json      — MapLibre style placeholder
  signature.ed25519  — detached Ed25519 signature (if key configured)

The archive is written to ``storage/navpacks/{version}.navpack``.
"""

from __future__ import annotations

import hashlib
import json
import os
import sqlite3
import tempfile
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from sqlmodel import Session, select

from app.core.config import settings
from app.models.building_model import Building
from app.models.floor_model import Floor
from app.models.navigation_model import NavigationNode, NavigationEdge, QRAnchor
from app.models.room_model import Room
from app.models.poi_model import PointOfInterest
from app.models.vertical_connector_model import VerticalConnector
from app.models.map_version_model import MapVersion, NavPack

from app.schemas.map import VectorMapData, BuildingModelSchema, MapPackageManifest


def _sha256(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def _try_sign(data: bytes) -> Optional[bytes]:
    """Sign *data* with the configured Ed25519 key.  Returns None if
    signing is not configured or the cryptography library is missing."""
    key_path = settings.NAVPACK_SIGNING_KEY_PATH
    if not key_path or not os.path.exists(key_path):
        return None
    try:
        from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
        from cryptography.hazmat.primitives import serialization

        with open(key_path, "rb") as f:
            private_key = serialization.load_pem_private_key(f.read(), password=None)
        return private_key.sign(data)
    except Exception:
        return None


class MapCompilerService:

    @staticmethod
    def compile_navpack(
        db: Session,
        building_id: int,
        map_version: MapVersion,
    ) -> NavPack:
        """Compile a real ``.navpack`` archive for the given building/version."""

        building = db.get(Building, building_id)
        floors = db.exec(select(Floor).where(Floor.building_id == building_id)).all()
        floor_ids = [f.id for f in floors]

        # Gather all data
        nodes = db.exec(select(NavigationNode).where(NavigationNode.floor_id.in_(floor_ids))).all()
        node_ids = [n.id for n in nodes]
        edges = db.exec(select(NavigationEdge).where(
            NavigationEdge.from_node_id.in_(node_ids)
        )).all() if node_ids else []
        rooms = db.exec(select(Room).where(Room.floor_id.in_(floor_ids))).all()
        pois = db.exec(select(PointOfInterest).where(PointOfInterest.floor_id.in_(floor_ids))).all()
        anchors = db.exec(select(QRAnchor).where(QRAnchor.floor_id.in_(floor_ids))).all()
        connectors = db.exec(select(VerticalConnector).where(VerticalConnector.floor_id.in_(floor_ids))).all()

        # ── Create map.sqlite in a temp dir ──
        with tempfile.TemporaryDirectory() as tmpdir:
            sqlite_path = os.path.join(tmpdir, "map.sqlite")
            _build_sqlite(sqlite_path, floors, nodes, edges, rooms, pois, anchors, connectors)

            # ── style.json placeholder ──
            style_path = os.path.join(tmpdir, "style.json")
            with open(style_path, "w") as f:
                json.dump({
                    "version": 8,
                    "name": "hospital-indoor",
                    "sources": {},
                    "layers": [],
                }, f)

            # ── Compute file hashes ──
            sqlite_hash = _sha256(sqlite_path)
            style_hash = _sha256(style_path)

            # ── Build manifest ──
            now = datetime.now(timezone.utc)
            manifest = {
                "schema_version": "1.0",
                "hospital_id": building.hospital_id if building else None,
                "building_id": building_id,
                "building_name": building.name if building else "",
                "version": map_version.version_number,
                "generated_at": now.isoformat(),
                "published_at": (map_version.published_at or now).isoformat(),
                "min_navigator_version": "1.0.0",
                "floors_count": len(floors),
                "nodes_count": len(nodes),
                "edges_count": len(edges),
                "rooms_count": len(rooms),
                "pois_count": len(pois),
                "anchors_count": len(anchors),
                "files": {
                    "map.sqlite": {"sha256": sqlite_hash},
                    "style.json": {"sha256": style_hash},
                },
                "signing_key_id": "",
                "changelog": map_version.changelog or "",
            }

            manifest_path = os.path.join(tmpdir, "manifest.json")
            with open(manifest_path, "w") as f:
                json.dump(manifest, f, indent=2)

            # ── Sign ──
            sig_path = os.path.join(tmpdir, "signature.ed25519")
            manifest_bytes = json.dumps(manifest, sort_keys=True).encode()
            sig = _try_sign(manifest_bytes)
            if sig:
                with open(sig_path, "wb") as f:
                    f.write(sig)
                manifest["signing_key_id"] = "dev-ed25519"
                # Rewrite manifest with key id
                with open(manifest_path, "w") as f:
                    json.dump(manifest, f, indent=2)

            # ── Create ZIP archive ──
            storage_dir = os.path.join(settings.STORAGE_LOCAL_PATH, "navpacks")
            os.makedirs(storage_dir, exist_ok=True)
            archive_name = f"{map_version.version_number}.navpack"
            archive_path = os.path.join(storage_dir, archive_name)

            with zipfile.ZipFile(archive_path, "w", zipfile.ZIP_DEFLATED) as zf:
                zf.write(manifest_path, "manifest.json")
                zf.write(sqlite_path, "map.sqlite")
                zf.write(style_path, "style.json")
                if os.path.exists(sig_path):
                    zf.write(sig_path, "signature.ed25519")

            archive_hash = _sha256(archive_path)
            archive_size = os.path.getsize(archive_path)

            # ── Create NavPack DB record ──
            navpack = NavPack(
                map_version_id=map_version.id,
                schema_version="1.0",
                archive_uri=f"/api/v1/navigator/packages/{archive_name}",
                archive_path=archive_path,
                checksum_sha256=archive_hash,
                total_size_bytes=archive_size,
                signature_key_id=manifest.get("signing_key_id", ""),
                min_app_version="1.0.0",
                generated_at=now,
            )
            db.add(navpack)
            db.commit()
            db.refresh(navpack)

            return navpack

    @staticmethod
    def compile_navpack_legacy(
        session_id: int,
        building_model: BuildingModelSchema,
        vector_map: VectorMapData,
    ) -> MapPackageManifest:
        """Legacy in-memory compile (kept for pipeline orchestrator compat)."""
        package_name = f"pkg_hospital_{session_id}.navpack"
        download_url = f"http://localhost:8000/api/v1/maps/{session_id}/package"
        return MapPackageManifest(
            package_name=package_name,
            version="1.0.0",
            created_at=datetime.now(timezone.utc),
            building_name=building_model.building_name,
            floors_count=len(building_model.floors),
            nodes_count=len(vector_map.nodes),
            edges_count=len(vector_map.edges),
            download_url=download_url,
        )


# ── SQLite builder ─────────────────────────────────────────────────────

def _build_sqlite(path, floors, nodes, edges, rooms, pois, anchors, connectors):
    """Populate the offline SQLite database with all map data and FTS index."""
    conn = sqlite3.connect(path)
    c = conn.cursor()

    # -- Schema --
    c.executescript("""
        CREATE TABLE floors (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            floor_number INTEGER NOT NULL,
            display_name TEXT,
            level TEXT,
            elevation_meters REAL,
            map_width REAL,
            map_height REAL,
            crs_origin_x REAL DEFAULT 0,
            crs_origin_y REAL DEFAULT 0,
            crs_heading_degrees REAL DEFAULT 0,
            crs_scale REAL DEFAULT 1
        );

        CREATE TABLE nodes (
            id INTEGER PRIMARY KEY,
            stable_uuid TEXT UNIQUE NOT NULL,
            floor_id INTEGER NOT NULL REFERENCES floors(id),
            node_type TEXT NOT NULL,
            node_subtype TEXT,
            name TEXT,
            code TEXT,
            x REAL NOT NULL,
            y REAL NOT NULL,
            z REAL DEFAULT 0,
            is_accessible INTEGER DEFAULT 1,
            room_id INTEGER
        );

        CREATE TABLE edges (
            id INTEGER PRIMARY KEY,
            stable_uuid TEXT UNIQUE NOT NULL,
            from_node_id INTEGER NOT NULL REFERENCES nodes(id),
            to_node_id INTEGER NOT NULL REFERENCES nodes(id),
            edge_type TEXT NOT NULL,
            transition_type TEXT,
            distance REAL NOT NULL,
            length_meters REAL,
            width_meters REAL,
            slope_percent REAL,
            is_accessible INTEGER DEFAULT 1,
            is_bidirectional INTEGER DEFAULT 1,
            accessibility_json TEXT,
            closure_status TEXT,
            cost_override REAL
        );

        CREATE TABLE rooms (
            id INTEGER PRIMARY KEY,
            stable_uuid TEXT UNIQUE NOT NULL,
            floor_id INTEGER NOT NULL REFERENCES floors(id),
            name TEXT NOT NULL,
            display_name TEXT,
            room_number TEXT,
            room_type TEXT DEFAULT 'general',
            category TEXT,
            aliases_json TEXT,
            geometry_json TEXT,
            entrance_node_id INTEGER REFERENCES nodes(id),
            is_public INTEGER DEFAULT 1
        );

        CREATE TABLE pois (
            id INTEGER PRIMARY KEY,
            stable_uuid TEXT UNIQUE NOT NULL,
            floor_id INTEGER NOT NULL REFERENCES floors(id),
            name TEXT NOT NULL,
            code TEXT,
            poi_type TEXT NOT NULL,
            aliases_json TEXT,
            entrance_node_id INTEGER REFERENCES nodes(id),
            is_accessible INTEGER DEFAULT 1
        );

        CREATE TABLE anchors (
            id INTEGER PRIMARY KEY,
            stable_uuid TEXT UNIQUE NOT NULL,
            node_id INTEGER NOT NULL REFERENCES nodes(id),
            floor_id INTEGER NOT NULL REFERENCES floors(id),
            anchor_type TEXT DEFAULT 'qr',
            qr_code_value TEXT UNIQUE NOT NULL,
            signed_payload TEXT,
            x REAL, y REAL, z REAL,
            heading_degrees REAL,
            is_active INTEGER DEFAULT 1
        );

        CREATE TABLE vertical_connectors (
            id INTEGER PRIMARY KEY,
            connector_group_id TEXT NOT NULL,
            floor_id INTEGER NOT NULL REFERENCES floors(id),
            node_id INTEGER NOT NULL REFERENCES nodes(id),
            connector_type TEXT NOT NULL,
            name TEXT,
            available_direction TEXT DEFAULT 'both',
            is_accessible INTEGER DEFAULT 1,
            operational_status TEXT DEFAULT 'operational'
        );

        -- FTS5 virtual table for destination search
        CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
            name, display_name, room_number, aliases, category, poi_type,
            content='', tokenize='unicode61'
        );
    """)

    # -- Insert data --
    for f in floors:
        c.execute(
            "INSERT INTO floors VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
            (f.id, f.name, f.floor_number, f.display_name, f.level,
             f.elevation_meters, f.map_width, f.map_height,
             f.crs_origin_x, f.crs_origin_y, f.crs_heading_degrees, f.crs_scale),
        )

    for n in nodes:
        c.execute(
            "INSERT INTO nodes VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
            (n.id, n.stable_uuid, n.floor_id, n.node_type, n.node_subtype,
             n.name, n.code, n.x, n.y, n.z or 0, int(n.is_accessible), n.room_id),
        )

    for e in edges:
        c.execute(
            "INSERT INTO edges VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (e.id, e.stable_uuid, e.from_node_id, e.to_node_id, e.edge_type,
             e.transition_type, e.distance, e.length_meters, e.width_meters,
             e.slope_percent, int(e.is_accessible), int(e.is_bidirectional),
             e.accessibility_json, e.closure_status, e.cost_override),
        )

    for r in rooms:
        c.execute(
            "INSERT INTO rooms VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
            (r.id, r.stable_uuid, r.floor_id, r.name, r.display_name,
             r.room_number, r.room_type, r.category, r.aliases_json,
             r.geometry_json, r.entrance_node_id, int(r.is_public)),
        )
        # FTS index
        aliases = ""
        if r.aliases_json:
            try:
                aliases = " ".join(json.loads(r.aliases_json))
            except Exception:
                pass
        c.execute(
            "INSERT INTO search_index(name, display_name, room_number, aliases, category, poi_type) VALUES (?,?,?,?,?,?)",
            (r.name, r.display_name or "", r.room_number or "", aliases, r.category or "", r.room_type),
        )

    for p in pois:
        c.execute(
            "INSERT INTO pois VALUES (?,?,?,?,?,?,?,?,?)",
            (p.id, p.stable_uuid, p.floor_id, p.name, p.code,
             p.poi_type, p.aliases_json, p.entrance_node_id, int(p.is_accessible)),
        )
        aliases = ""
        if p.aliases_json:
            try:
                aliases = " ".join(json.loads(p.aliases_json))
            except Exception:
                pass
        c.execute(
            "INSERT INTO search_index(name, display_name, room_number, aliases, category, poi_type) VALUES (?,?,?,?,?,?)",
            (p.name, "", "", aliases, "", p.poi_type),
        )

    for a in anchors:
        c.execute(
            "INSERT INTO anchors VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
            (a.id, a.stable_uuid, a.node_id, a.floor_id, a.anchor_type,
             a.qr_code_value, a.signed_payload, a.x, a.y, a.z,
             a.heading_degrees, int(a.is_active)),
        )

    for vc in connectors:
        c.execute(
            "INSERT INTO vertical_connectors VALUES (?,?,?,?,?,?,?,?,?)",
            (vc.id, vc.connector_group_id, vc.floor_id, vc.node_id,
             vc.connector_type, vc.name, vc.available_direction,
             int(vc.is_accessible), vc.operational_status),
        )

    conn.commit()
    conn.close()
