import pytest
from app.services.scan_service import ScanService
from app.schemas.map import VectorMapData, NavigationNodeSchema, NavigationEdgeSchema


def test_save_and_get_map_data():
    session_id = 9999
    nodes = [
        NavigationNodeSchema(
            id="n_1",
            label="Reception Desk",
            type="reception",
            x=50.0,
            y=60.0,
            z=0.0,
            accessible=True,
        ),
        NavigationNodeSchema(
            id="n_2",
            label="Elevator",
            type="elevator",
            x=120.0,
            y=140.0,
            z=0.0,
            accessible=True,
        ),
    ]
    edges = [
        NavigationEdgeSchema(
            id="e_1",
            from_node="n_1",
            to_node="n_2",
            distance=100.0,
            accessible=True,
            edge_type="pathway",
        )
    ]
    rooms = [
        {"id": "r_1", "name": "Emergency Triage", "x": 30.0, "y": 40.0, "width": 120, "height": 80},
        {"id": "r_2", "name": "Radiology Lab", "x": 160.0, "y": 40.0, "width": 120, "height": 80},
    ]
    doors = [
        {"id": "d_1", "name": "Main Door", "x": 45.0, "y": 40.0},
        {"id": "d_2", "name": "Lab Door", "x": 175.0, "y": 40.0},
    ]

    vector_payload = VectorMapData(
        schema_version="1.0",
        session_id=session_id,
        floor_id=1,
        nodes=nodes,
        edges=edges,
        rooms=rooms,
        doors=doors,
    )

    saved = ScanService.save_map_data(session_id, vector_payload)
    assert saved.session_id == session_id
    assert len(saved.rooms) == 2
    assert len(saved.doors) == 2
    assert len(saved.nodes) == 2

    # Fetch and verify persistence
    retrieved = ScanService.get_map_data(session_id, floor_id=1)
    assert retrieved.session_id == session_id
    assert len(retrieved.rooms) == 2
    assert retrieved.rooms[0]["name"] == "Emergency Triage"
    assert len(retrieved.doors) == 2
    assert retrieved.doors[0]["name"] == "Main Door"
    assert len(retrieved.nodes) == 2
    assert retrieved.nodes[0].label == "Reception Desk"
