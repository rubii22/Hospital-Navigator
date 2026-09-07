import uuid
from typing import TYPE_CHECKING, Optional, List
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampMixin

if TYPE_CHECKING:
    from .floor_model import Floor
    from .department_model import Department
    from .navigation_model import NavigationNode


def _new_uuid() -> str:
    return str(uuid.uuid4())


class Room(TimestampMixin, table=True):
    __tablename__ = "rooms"

    id: Optional[int] = Field(default=None, primary_key=True)
    stable_uuid: str = Field(
        default_factory=_new_uuid, max_length=36, unique=True, index=True, nullable=False,
    )
    floor_id: int = Field(foreign_key="floors.id", index=True, nullable=False)
    department_id: Optional[int] = Field(
        default=None, foreign_key="departments.id", index=True
    )
    map_version_id: Optional[int] = Field(
        default=None, foreign_key="map_versions.id", index=True,
    )
    name: str = Field(max_length=255, nullable=False)
    display_name: Optional[str] = Field(default=None, max_length=255)
    room_number: Optional[str] = Field(default=None, max_length=50)
    room_type: str = Field(
        default="general", max_length=50, nullable=False
    )  # general, icu, opd, mri, pharmacy, washroom, corridor
    category: Optional[str] = Field(default=None, max_length=50)
    # JSON array of alternative names for FTS search
    aliases_json: Optional[str] = Field(default=None)
    # GeoJSON polygon or WKT geometry
    geometry_json: Optional[str] = Field(default=None)
    # FK to the navigation node that serves as the entrance to this room
    entrance_node_id: Optional[int] = Field(
        default=None, foreign_key="navigation_nodes.id",
    )
    is_public: bool = Field(default=True, nullable=False)
    review_state: str = Field(default="pending", max_length=30, nullable=False)
    status: str = Field(default="active", max_length=30, nullable=False)

    floor: Optional["Floor"] = Relationship(back_populates="rooms")
    department: Optional["Department"] = Relationship(back_populates="rooms")
    navigation_nodes: List["NavigationNode"] = Relationship(
        back_populates="room",
        sa_relationship_kwargs={"foreign_keys": "[NavigationNode.room_id]"},
    )
    entrance_node: Optional["NavigationNode"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Room.entrance_node_id]"},
    )

