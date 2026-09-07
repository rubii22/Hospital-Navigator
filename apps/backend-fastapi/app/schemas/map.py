from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class PointCloudPoint(BaseModel):
    x: float
    y: float
    z: float
    r: float = 0.4
    g: float = 0.5
    b: float = 0.95


class PointCloudArtifact(BaseModel):
    schema_version: str = "1.0"
    session_id: int
    point_count: int
    points: List[PointCloudPoint]


class NavigationNodeSchema(BaseModel):
    id: str
    label: str
    type: str  # room_entrance, corridor, intersection, stair, elevator, landmark
    x: float
    y: float
    z: float = 0.0
    accessible: bool = True
    metadata: Optional[Dict[str, Any]] = None


class NavigationEdgeSchema(BaseModel):
    id: str
    from_node: str
    to_node: str
    distance: float
    accessible: bool = True
    edge_type: str = "corridor"  # corridor, door, stair, elevator


class VectorMapData(BaseModel):
    schema_version: str = "1.0"
    session_id: int
    floor_id: int
    nodes: List[NavigationNodeSchema]
    edges: List[NavigationEdgeSchema]
    rooms: List[Dict[str, Any]] = []
    doors: List[Dict[str, Any]] = []


class RoomModelSchema(BaseModel):
    id: str
    name: str
    room_number: Optional[str] = None
    department: Optional[str] = None
    polygon: List[Dict[str, float]]  # List of {x, y}


class FloorModelSchema(BaseModel):
    floor_id: int
    name: str
    level: int
    walls: List[Dict[str, Any]] = []
    rooms: List[RoomModelSchema] = []
    corridors: List[Dict[str, Any]] = []


class BuildingModelSchema(BaseModel):
    schema_version: str = "1.0"
    hospital_name: str
    building_name: str
    floors: List[FloorModelSchema] = []


class ValidationErrorItem(BaseModel):
    type: str
    severity: str  # error, warning
    message: str
    target_id: Optional[str] = None


class ValidationReport(BaseModel):
    schema_version: str = "1.0"
    status: str  # valid, warning, error
    errors: List[ValidationErrorItem] = []
    warnings: List[ValidationErrorItem] = []


class MapPackageManifest(BaseModel):
    schema_version: str = "1.0"
    package_name: str
    version: str
    created_at: datetime
    building_name: str
    floors_count: int
    nodes_count: int
    edges_count: int
    download_url: str
