"""Map feature model — generic spatial features on a floor.

Features represent any drawn/imported/detected spatial entity: rooms,
corridors, walls, doors, POIs, hazards, etc.  Each feature tracks its
source (import, manual edit, auto-detection) and review state so that
unreviewed auto-detections cannot be published.
"""

import uuid
from typing import TYPE_CHECKING, Optional
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampMixin

if TYPE_CHECKING:
    from .floor_model import Floor
    from .user_model import User


def _new_uuid() -> str:
    return str(uuid.uuid4())


class MapFeature(TimestampMixin, table=True):
    __tablename__ = "map_features"

    id: Optional[int] = Field(default=None, primary_key=True)
    stable_uuid: str = Field(
        default_factory=_new_uuid, max_length=36, unique=True, index=True, nullable=False,
    )
    floor_id: int = Field(foreign_key="floors.id", index=True, nullable=False)
    map_version_id: Optional[int] = Field(
        default=None, foreign_key="map_versions.id", index=True,
    )
    feature_type: str = Field(
        max_length=50, nullable=False
    )  # room, corridor, wall, door, poi, hazard
    # GeoJSON (polygon, polyline, or point)
    geometry_json: str = Field(nullable=False)
    source: str = Field(
        default="manual", max_length=30, nullable=False
    )  # import, manual, detected
    confidence: Optional[float] = Field(default=None)
    review_state: str = Field(
        default="pending", max_length=30, nullable=False
    )  # pending, accepted, rejected
    reviewer_id: Optional[int] = Field(
        default=None, foreign_key="users.id", index=True,
    )
    # Arbitrary key-value properties (e.g. room name, door width, hazard type)
    properties_json: Optional[str] = Field(default=None)

    floor: Optional["Floor"] = Relationship()
    reviewer: Optional["User"] = Relationship()
