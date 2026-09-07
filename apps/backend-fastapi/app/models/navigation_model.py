import uuid
from typing import TYPE_CHECKING, Optional, List
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampMixin

if TYPE_CHECKING:
    from .floor_model import Floor
    from .room_model import Room
    from .poi_model import PointOfInterest


def _new_uuid() -> str:
    return str(uuid.uuid4())


class NavigationNode(TimestampMixin, table=True):
    __tablename__ = "navigation_nodes"

    id: Optional[int] = Field(default=None, primary_key=True)
    stable_uuid: str = Field(
        default_factory=_new_uuid, max_length=36, unique=True, index=True, nullable=False,
    )
    floor_id: int = Field(foreign_key="floors.id", index=True, nullable=False)
    room_id: Optional[int] = Field(default=None, foreign_key="rooms.id", index=True)
    poi_id: Optional[int] = Field(
        default=None, foreign_key="points_of_interest.id", index=True
    )
    map_version_id: Optional[int] = Field(
        default=None, foreign_key="map_versions.id", index=True,
    )
    node_type: str = Field(max_length=50, nullable=False)
    # Subtypes: entrance, corridor, intersection, elevator, stairs, ramp,
    # escalator, landmark, door, room, poi
    node_subtype: Optional[str] = Field(default=None, max_length=50)
    name: Optional[str] = Field(default=None, max_length=255)
    code: Optional[str] = Field(default=None, max_length=100)
    x: float = Field(nullable=False)
    y: float = Field(nullable=False)
    z: Optional[float] = Field(default=0.0)
    coordinates: Optional[str] = Field(default=None)  # WKT or GeoJSON geometry string
    is_accessible: bool = Field(default=True, nullable=False)
    review_state: str = Field(default="pending", max_length=30, nullable=False)
    status: str = Field(default="active", max_length=30, nullable=False)

    floor: Optional["Floor"] = Relationship(back_populates="nodes")
    room: Optional["Room"] = Relationship(
        back_populates="navigation_nodes",
        sa_relationship_kwargs={"foreign_keys": "[NavigationNode.room_id]"},
    )
    qr_anchor: Optional["QRAnchor"] = Relationship(back_populates="node")


class NavigationEdge(TimestampMixin, table=True):
    __tablename__ = "navigation_edges"

    id: Optional[int] = Field(default=None, primary_key=True)
    stable_uuid: str = Field(
        default_factory=_new_uuid, max_length=36, unique=True, index=True, nullable=False,
    )
    from_node_id: int = Field(
        foreign_key="navigation_nodes.id", index=True, nullable=False
    )
    to_node_id: int = Field(
        foreign_key="navigation_nodes.id", index=True, nullable=False
    )
    map_version_id: Optional[int] = Field(
        default=None, foreign_key="map_versions.id", index=True,
    )
    edge_type: str = Field(
        max_length=50, nullable=False
    )  # corridor, door, stairs, elevator, ramp, escalator
    # Transition type for vertical connectors
    transition_type: Optional[str] = Field(default=None, max_length=50)
    distance: float = Field(nullable=False)  # A* weight (metres)
    length_meters: Optional[float] = Field(default=None)
    width_meters: Optional[float] = Field(default=None)
    slope_percent: Optional[float] = Field(default=None)
    is_accessible: bool = Field(default=True, nullable=False)
    is_bidirectional: bool = Field(default=True, nullable=False)
    polyline_json: Optional[str] = Field(default=None)  # JSON array of {x, y} for non-straight edges
    # Per-profile accessibility attributes, e.g.
    # {"wheelchair": false, "no_stairs": true, "staff": true}
    accessibility_json: Optional[str] = Field(default=None)
    closure_status: Optional[str] = Field(default=None, max_length=30)  # open, closed, restricted
    cost_override: Optional[float] = Field(default=None)

    from_node: Optional["NavigationNode"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[NavigationEdge.from_node_id]"}
    )
    to_node: Optional["NavigationNode"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[NavigationEdge.to_node_id]"}
    )


class QRAnchor(TimestampMixin, table=True):
    __tablename__ = "qr_anchors"

    id: Optional[int] = Field(default=None, primary_key=True)
    stable_uuid: str = Field(
        default_factory=_new_uuid, max_length=36, unique=True, index=True, nullable=False,
    )
    node_id: int = Field(
        foreign_key="navigation_nodes.id", index=True, nullable=False, unique=True
    )
    floor_id: int = Field(foreign_key="floors.id", index=True, nullable=False)
    map_version_id: Optional[int] = Field(
        default=None, foreign_key="map_versions.id", index=True,
    )
    anchor_type: str = Field(default="qr", max_length=30, nullable=False)  # qr, ble, visual
    qr_code_value: str = Field(max_length=150, unique=True, index=True, nullable=False)
    signed_payload: Optional[str] = Field(default=None)  # Ed25519-signed JSON
    label: Optional[str] = Field(default=None, max_length=150)
    x: Optional[float] = None
    y: Optional[float] = None
    z: Optional[float] = None
    heading_degrees: Optional[float] = Field(default=None)
    placement_evidence_url: Optional[str] = Field(default=None, max_length=500)
    survey_accuracy_meters: Optional[float] = Field(default=None)
    is_active: bool = Field(default=True, nullable=False)

    node: Optional["NavigationNode"] = Relationship(back_populates="qr_anchor")
    floor: Optional["Floor"] = Relationship(back_populates="qr_anchors")


class RoutingProfile(TimestampMixin, table=True):
    __tablename__ = "routing_profiles"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(
        max_length=50, unique=True, nullable=False
    )  # standard, wheelchair, no_stairs, staff
    description: Optional[str] = Field(default=None, max_length=255)
    max_slope_percent: Optional[float] = Field(default=10.0)
    min_door_width_meters: Optional[float] = Field(default=None)
    allow_stairs: bool = Field(default=True, nullable=False)
    allow_elevators: bool = Field(default=True, nullable=False)
    allow_ramps: bool = Field(default=True, nullable=False)
    # JSON list of edge types that are prohibited for this profile
    restricted_edge_types_json: Optional[str] = Field(default=None)
    is_default: bool = Field(default=False, nullable=False)
