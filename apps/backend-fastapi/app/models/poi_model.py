import uuid
from typing import TYPE_CHECKING, Optional, List
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampMixin

if TYPE_CHECKING:
    from .floor_model import Floor
    from .department_model import Department


def _new_uuid() -> str:
    return str(uuid.uuid4())


class POICategory(SQLModel, table=True):
    __tablename__ = "poi_categories"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, nullable=False)
    code: str = Field(max_length=50, unique=True, index=True, nullable=False)
    icon: Optional[str] = Field(default=None, max_length=255)
    color: Optional[str] = Field(default=None, max_length=30)

    pois: List["PointOfInterest"] = Relationship(back_populates="category")


class PointOfInterest(TimestampMixin, table=True):
    __tablename__ = "points_of_interest"

    id: Optional[int] = Field(default=None, primary_key=True)
    stable_uuid: str = Field(
        default_factory=_new_uuid, max_length=36, unique=True, index=True, nullable=False,
    )
    hospital_id: int = Field(foreign_key="hospitals.id", index=True, nullable=False)
    building_id: Optional[int] = Field(
        default=None, foreign_key="buildings.id", index=True
    )
    floor_id: int = Field(foreign_key="floors.id", index=True, nullable=False)
    department_id: Optional[int] = Field(
        default=None, foreign_key="departments.id", index=True
    )
    room_id: Optional[int] = Field(default=None, foreign_key="rooms.id", index=True)
    category_id: int = Field(
        foreign_key="poi_categories.id", index=True, nullable=False
    )
    map_version_id: Optional[int] = Field(
        default=None, foreign_key="map_versions.id", index=True,
    )
    name: str = Field(max_length=255, nullable=False)
    code: Optional[str] = Field(default=None, max_length=100)
    description: Optional[str] = None
    poi_type: str = Field(
        max_length=50, nullable=False
    )  # pharmacy, washroom, elevator, exit, reception, emergency
    location_geometry: Optional[str] = Field(
        default=None
    )  # WKT or GeoJSON geometry string
    # JSON array of alternative names for FTS search
    aliases_json: Optional[str] = Field(default=None)
    # FK to the navigation node that serves as the entrance
    entrance_node_id: Optional[int] = Field(
        default=None, foreign_key="navigation_nodes.id",
    )
    is_accessible: bool = Field(default=True, nullable=False)
    review_state: str = Field(default="pending", max_length=30, nullable=False)
    status: str = Field(default="active", max_length=30, nullable=False)

    floor: Optional["Floor"] = Relationship(back_populates="pois")
    department: Optional["Department"] = Relationship(back_populates="pois")
    category: Optional["POICategory"] = Relationship(back_populates="pois")
