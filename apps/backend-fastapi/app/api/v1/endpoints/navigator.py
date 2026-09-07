import os
import json
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlmodel import Session, select

from app.core.database import get_db
from app.models.hospital_model import Hospital, EmergencyContact
from app.models.building_model import Building
from app.models.floor_model import Floor
from app.models.room_model import Room
from app.models.department_model import Department
from app.models.mapping_session_model import MappingSession
from app.models.navigation_model import NavigationNode, NavigationEdge, QRAnchor

router = APIRouter()
logger = logging.getLogger(__name__)


class HospitalSummary(BaseModel):
    id: int
    name: str
    code: str
    address: Optional[str] = None
    phone: Optional[str] = None
    distance: str = "Nearby"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    floors: List[str] = []
    floors_count: int = 0
    buildings_count: int = 0


class DestinationItem(BaseModel):
    id: str
    raw_id: int
    name: str
    detail: str
    icon: str
    category: str  # 'Department' | 'Room' | 'Service'
    floor_id: Optional[int] = None
    floor_name: Optional[str] = None
    building_name: Optional[str] = None
    room_number: Optional[str] = None
    type: Optional[str] = None


class EmergencyContactItem(BaseModel):
    id: int
    title: str
    phone_number: str
    icon: str = "phone"
    category: str = "phone"


class MapPackageInfo(BaseModel):
    version: str
    size: str
    updated: str
    floors_count: int
    nodes_count: int
    edges_count: int
    download_url: str


class HospitalBootstrapResponse(BaseModel):
    hospital: Dict[str, Any]
    buildings: List[Dict[str, Any]]
    destinations: List[DestinationItem]
    facilities: List[str]
    emergency_contacts: List[EmergencyContactItem]
    map_package: MapPackageInfo


def _get_icon_for_destination(name: str, category: str, room_type: Optional[str] = None) -> str:
    name_lower = (name or "").lower()
    type_lower = (room_type or "").lower()
    
    if "cardio" in name_lower:
        return "department"
    elif "radio" in name_lower or "x-ray" in name_lower or "scan" in name_lower:
        return "radiology"
    elif "pharm" in name_lower or "med" in name_lower or type_lower == "pharmacy":
        return "pharmacy"
    elif "emerg" in name_lower or "trauma" in name_lower or "icu" in name_lower:
        return "emergency"
    elif "mri" in name_lower or "ct" in name_lower:
        return "room"
    elif category == "Department":
        return "department"
    elif category == "Service":
        return "services"
    return "room"


@router.get("/hospitals", response_model=List[HospitalSummary])
def list_navigator_hospitals(db: Session = Depends(get_db)) -> List[HospitalSummary]:
    """Lists all hospitals with floor and building metadata for the navigator."""
    hospitals = db.exec(select(Hospital)).all()
    results: List[HospitalSummary] = []

    for h in hospitals:
        buildings = db.exec(select(Building).where(Building.hospital_id == h.id)).all()
        building_ids = [b.id for b in buildings if b.id is not None]

        floor_names: List[str] = []
        if building_ids:
            floors = db.exec(select(Floor).where(Floor.building_id.in_(building_ids))).all()
            for f in sorted(floors, key=lambda x: x.floor_number):
                floor_names.append(f.display_name or f.name or f"Floor {f.floor_number}")

        results.append(
            HospitalSummary(
                id=h.id,
                name=h.name,
                code=h.code,
                address=h.address or "Main Medical Campus",
                phone=h.phone,
                distance="0.8 km",
                latitude=h.latitude,
                longitude=h.longitude,
                floors=floor_names if floor_names else ["Ground Floor", "Floor 1"],
                floors_count=len(floor_names) if floor_names else 2,
                buildings_count=len(buildings),
            )
        )

    return results


@router.get("/hospitals/{hospital_id}/bootstrap", response_model=HospitalBootstrapResponse)
def get_hospital_bootstrap(hospital_id: int, db: Session = Depends(get_db)) -> HospitalBootstrapResponse:
    """Provides the full bootstrap dataset for offline navigator initialize & sync."""
    hospital = db.get(Hospital, hospital_id)
    if not hospital:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found")

    buildings = db.exec(select(Building).where(Building.hospital_id == hospital_id)).all()
    building_ids = [b.id for b in buildings if b.id is not None]
    building_map = {b.id: b.name for b in buildings}

    floors = db.exec(select(Floor).where(Floor.building_id.in_(building_ids))).all() if building_ids else []
    floor_ids = [f.id for f in floors if f.id is not None]
    floor_map = {f.id: f for f in floors}

    departments = db.exec(select(Department).where(Department.hospital_id == hospital_id)).all()
    rooms = db.exec(select(Room).where(Room.floor_id.in_(floor_ids))).all() if floor_ids else []

    # Map destinations
    destinations: List[DestinationItem] = []

    # 1. Departments
    for d in departments:
        f_obj = floor_map.get(d.floor_id) if d.floor_id else None
        b_name = building_map.get(f_obj.building_id) if f_obj and f_obj.building_id else "Main Hospital"
        f_name = f_obj.display_name or f_obj.name if f_obj else "Ground Floor"
        
        destinations.append(
            DestinationItem(
                id=f"dept_{d.id}",
                raw_id=d.id,
                name=d.name,
                detail=f"{f_name} · {b_name}",
                icon=_get_icon_for_destination(d.name, "Department"),
                category="Department",
                floor_id=d.floor_id,
                floor_name=f_name,
                building_name=b_name,
                type="department",
            )
        )

    # 2. Rooms
    for r in rooms:
        f_obj = floor_map.get(r.floor_id)
        b_name = building_map.get(f_obj.building_id) if f_obj and f_obj.building_id else "Main Hospital"
        f_name = f_obj.display_name or f_obj.name if f_obj else "Floor 1"
        cat = "Service" if r.room_type in ["pharmacy", "washroom", "opd"] else "Room"

        destinations.append(
            DestinationItem(
                id=f"room_{r.id}",
                raw_id=r.id,
                name=r.name,
                detail=f"{f_name} · {b_name}",
                icon=_get_icon_for_destination(r.name, cat, r.room_type),
                category=cat,
                floor_id=r.floor_id,
                floor_name=f_name,
                building_name=b_name,
                room_number=r.room_number,
                type=r.room_type,
            )
        )

    # Emergency contacts
    db_contacts = db.exec(
        select(EmergencyContact).where(
            EmergencyContact.hospital_id == hospital_id,
            EmergencyContact.is_active == True,
        )
    ).all()

    emergency_contacts: List[EmergencyContactItem] = []
    if db_contacts:
        for c in db_contacts:
            icon = "ambulance" if "ambulance" in c.title.lower() else ("location" if "emergency" in c.title.lower() or "triage" in c.title.lower() else "phone")
            emergency_contacts.append(
                EmergencyContactItem(
                    id=c.id,
                    title=c.title,
                    phone_number=c.phone_number,
                    icon=icon,
                    category=icon,
                )
            )
    else:
        # Provide hospital's actual phone or standard medical hotlines
        hospital_phone = hospital.phone or "+1-800-555-0199"
        emergency_contacts = [
            EmergencyContactItem(id=1, title="Hospital Main Reception", phone_number=hospital_phone, icon="phone", category="phone"),
            EmergencyContactItem(id=2, title="Ambulance & Trauma Hotline", phone_number="911", icon="ambulance", category="ambulance"),
            EmergencyContactItem(id=3, title="Emergency Triage Desk", phone_number=hospital_phone, icon="location", category="location"),
        ]

    # Facilities
    facilities = [
        "Accessible entrance & ramps",
        "Elevators available to all floors",
        "Wheelchair accessible restrooms",
        "Emergency nurse call stations",
        "Pharmacy and Diagnostics",
    ]

    # Counts and package info
    total_nodes = 0
    total_edges = 0
    if floor_ids:
        nodes = db.exec(select(NavigationNode).where(NavigationNode.floor_id.in_(floor_ids))).all()
        edges = db.exec(select(NavigationEdge)).all()
        total_nodes = len(nodes)
        total_edges = len(edges)

    floor_names_list = [f.display_name or f.name for f in floors] if floors else ["Ground Floor", "Floor 1"]

    buildings_payload = []
    for b in buildings:
        b_floors = [f for f in floors if f.building_id == b.id]
        buildings_payload.append({
            "id": b.id,
            "name": b.name,
            "code": b.code,
            "floors": [
                {
                    "id": f.id,
                    "name": f.name,
                    "floor_number": f.floor_number,
                    "display_name": f.display_name or f.name,
                    "rooms_count": len([r for r in rooms if r.floor_id == f.id])
                }
                for f in b_floors
            ]
        })

    return HospitalBootstrapResponse(
        hospital={
            "id": hospital.id,
            "name": hospital.name,
            "code": hospital.code,
            "address": hospital.address or "Healthcare Complex",
            "phone": hospital.phone,
            "floors": floor_names_list,
        },
        buildings=buildings_payload,
        destinations=destinations,
        facilities=facilities,
        emergency_contacts=emergency_contacts,
        map_package=MapPackageInfo(
            version="1.2.0",
            size="2.4 MB",
            updated=datetime.now(timezone.utc).strftime("%d %b %Y"),
            floors_count=len(floors),
            nodes_count=max(total_nodes, len(destinations) * 2),
            edges_count=max(total_edges, len(destinations) * 3),
            download_url=f"/api/v1/navigator/hospitals/{hospital_id}/package",
        ),
    )


@router.get("/hospitals/{hospital_id}/search", response_model=List[DestinationItem])
def search_destinations(
    hospital_id: int,
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
) -> List[DestinationItem]:
    """Searches departments, rooms, and services for a given hospital."""
    bootstrap = get_hospital_bootstrap(hospital_id=hospital_id, db=db)
    term = q.strip().lower()
    return [d for d in bootstrap.destinations if term in d.name.lower() or (d.detail and term in d.detail.lower()) or (d.room_number and term in d.room_number.lower())]


@router.get("/hospitals/{hospital_id}/floors/{floor_id}/map")
def get_floor_vector_map(
    hospital_id: int,
    floor_id: int,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Retrieves compiled vector map (rooms, doors, nodes, edges) for a floor."""
    floor = db.get(Floor, floor_id)
    if not floor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Floor not found")

    # Check for latest completed session artifact
    stmt = (
        select(MappingSession)
        .where(MappingSession.floor_id == floor_id, MappingSession.status == "completed")
        .order_by(MappingSession.id.desc())
    )
    session = db.exec(stmt).first()

    if session:
        artifact_path = os.path.join("storage", "artifacts", f"map_data_{session.id}.json")
        if os.path.exists(artifact_path):
            try:
                with open(artifact_path, "r") as f:
                    data = json.load(f)
                    return data
            except Exception as e:
                logger.error(f"Error reading artifact {artifact_path}: {e}")

    # Fetch DB records
    db_rooms = db.exec(select(Room).where(Room.floor_id == floor_id)).all()
    db_nodes = db.exec(select(NavigationNode).where(NavigationNode.floor_id == floor_id)).all()
    node_ids = [n.id for n in db_nodes if n.id is not None]
    node_map = {n.id: n for n in db_nodes}

    db_edges = []
    if node_ids:
        db_edges = db.exec(
            select(NavigationEdge).where(
                NavigationEdge.from_node_id.in_(node_ids),
                NavigationEdge.to_node_id.in_(node_ids)
            )
        ).all()

    # Build room polygons based on associated room nodes or default layout
    rooms_list = []
    for idx, r in enumerate(db_rooms):
        # Check if this room has a node
        r_node = next((n for n in db_nodes if n.room_id == r.id and n.node_type == "room"), None)
        if r_node:
            rx = r_node.x
            ry = r_node.y
        else:
            rx = 15.0 + (idx % 3) * 20.0
            ry = 12.0 + (idx // 3) * 16.0

        w = 14.0
        h = 10.0
        rooms_list.append({
            "id": f"room_{r.id}",
            "room_id": r.id,
            "name": r.name,
            "room_number": r.room_number,
            "type": r.room_type,
            "x": rx - (w / 2),
            "y": ry - (h / 2),
            "width": w,
            "height": h,
            "center": {"x": rx, "y": ry},
            "bounds": [
                {"x": rx - (w / 2), "y": ry - (h / 2)},
                {"x": rx + (w / 2), "y": ry - (h / 2)},
                {"x": rx + (w / 2), "y": ry + (h / 2)},
                {"x": rx - (w / 2), "y": ry + (h / 2)},
            ]
        })

    # Build door coordinates
    doors_list = []
    for n in db_nodes:
        if n.node_type == "door":
            doors_list.append({
                "id": f"door_{n.id}",
                "node_id": n.id,
                "room_id": n.room_id,
                "label": n.name,
                "x": n.x,
                "y": n.y,
                "z": n.z or 0.0,
            })

    nodes_list = [
        {
            "id": f"node_{n.id}",
            "raw_id": n.id,
            "label": n.name or n.node_type,
            "code": n.code,
            "type": n.node_type,
            "x": n.x,
            "y": n.y,
            "z": n.z or 0.0,
            "room_id": n.room_id,
            "accessible": n.is_accessible
        }
        for n in db_nodes
    ]

    edges_list = [
        {
            "id": f"edge_{e.id}",
            "from_node_id": f"node_{e.from_node_id}",
            "to_node_id": f"node_{e.to_node_id}",
            "from_raw_id": e.from_node_id,
            "to_raw_id": e.to_node_id,
            "edge_type": e.edge_type,
            "distance": e.distance,
            "accessible": e.is_accessible,
            "bidirectional": e.is_bidirectional,
        }
        for e in db_edges
    ]

    return {
        "schema_version": "2.0",
        "floor_id": floor_id,
        "floor_name": floor.display_name or floor.name,
        "floor_number": floor.floor_number,
        "dimensions": {
            "width": floor.map_width or 70.0,
            "height": floor.map_height or 50.0,
            "units": "meters",
        },
        "rooms": rooms_list,
        "doors": doors_list,
        "nodes": nodes_list,
        "edges": edges_list,
    }


@router.get("/hospitals/{hospital_id}/package")
def download_offline_package(hospital_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Generates and returns the complete offline navigation package for download."""
    bootstrap = get_hospital_bootstrap(hospital_id=hospital_id, db=db)

    # Collect vector maps for all floors
    floors_data = []
    for b in bootstrap.buildings:
        for f in b.get("floors", []):
            floor_id = f["id"]
            vector_map = get_floor_vector_map(hospital_id=hospital_id, floor_id=floor_id, db=db)
            floors_data.append({
                "floor_id": floor_id,
                "building_id": b["id"],
                "floor_number": f["floor_number"],
                "display_name": f["display_name"],
                "vector_map": vector_map,
            })

    package_payload = {
        "manifest": {
            "hospital_id": hospital_id,
            "hospital_name": bootstrap.hospital.get("name"),
            "version": bootstrap.map_package.version,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "floors_count": len(floors_data),
            "destinations_count": len(bootstrap.destinations),
        },
        "bootstrap": bootstrap.model_dump(),
        "floors": floors_data,
    }

    return package_payload
