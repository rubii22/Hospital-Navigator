from typing import TYPE_CHECKING, Optional, List
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampMixin

if TYPE_CHECKING:
    from .building_model import Building
    from .department_model import Department
    from .room_model import Room
    from .poi_model import PointOfInterest
    from .navigation_model import NavigationNode, QRAnchor


class Floor(TimestampMixin, table=True):
    __tablename__ = "floors"

    id: Optional[int] = Field(default=None, primary_key=True)
    building_id: int = Field(foreign_key="buildings.id", index=True, nullable=False)
    name: str = Field(max_length=255, nullable=False)
    floor_number: int = Field(nullable=False)
    display_name: Optional[str] = Field(default=None, max_length=100)
    description: Optional[str] = None

    # Semantic level label (e.g. "B2", "B1", "G", "1", "2") for display
    level: Optional[str] = Field(default=None, max_length=10)

    # Metric coordinate reference system metadata
    elevation_meters: Optional[float] = Field(default=None)
    crs_origin_x: Optional[float] = Field(default=0.0)
    crs_origin_y: Optional[float] = Field(default=0.0)
    crs_heading_degrees: Optional[float] = Field(default=0.0)
    crs_scale: Optional[float] = Field(default=1.0)  # pixels-per-meter

    map_width: Optional[float] = None   # metres
    map_height: Optional[float] = None  # metres
    map_bounds_json: Optional[str] = Field(default=None)  # JSON [{x,y}, ...]

    elevation: Optional[float] = None
    status: str = Field(default="active", max_length=30, nullable=False)

    building: Optional["Building"] = Relationship(back_populates="floors")
    departments: List["Department"] = Relationship(back_populates="floor")
    rooms: List["Room"] = Relationship(
        back_populates="floor", sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    pois: List["PointOfInterest"] = Relationship(
        back_populates="floor", sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    nodes: List["NavigationNode"] = Relationship(
        back_populates="floor", sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    floor_maps: List["FloorMap"] = Relationship(
        back_populates="floor", sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    qr_anchors: List["QRAnchor"] = Relationship(
        back_populates="floor", sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class FloorMap(TimestampMixin, table=True):
    __tablename__ = "floor_maps"

    id: Optional[int] = Field(default=None, primary_key=True)
    floor_id: int = Field(foreign_key="floors.id", index=True, nullable=False)
    image_url: str = Field(max_length=500, nullable=False)
    source_type: Optional[str] = Field(default=None, max_length=30)  # svg, dxf, pdf, image
    source_hash: Optional[str] = Field(default=None, max_length=64)  # SHA-256
    scale_pixels_per_meter: Optional[float] = Field(default=1.0)
    origin_x: Optional[float] = Field(default=0.0)
    origin_y: Optional[float] = Field(default=0.0)
    rotation_degrees: Optional[float] = Field(default=0.0)
    is_active: bool = Field(default=True, nullable=False)

    floor: Optional["Floor"] = Relationship(back_populates="floor_maps")
