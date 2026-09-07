"""Vertical connector model — links floors for cross-floor routing.

A connector group (e.g. "Elevator A") has one row per floor it serves.
Each row points to the navigation node on that floor and carries metadata
about direction, accessibility, and operational status.
"""

import uuid
from typing import TYPE_CHECKING, Optional
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampMixin

if TYPE_CHECKING:
    from .floor_model import Floor
    from .navigation_model import NavigationNode


def _new_uuid() -> str:
    return str(uuid.uuid4())


class VerticalConnector(TimestampMixin, table=True):
    __tablename__ = "vertical_connectors"

    id: Optional[int] = Field(default=None, primary_key=True)
    # Shared group ID across floors (e.g. all rows for "Elevator A" share
    # the same connector_group_id).
    connector_group_id: str = Field(
        max_length=36, index=True, nullable=False,
    )
    floor_id: int = Field(foreign_key="floors.id", index=True, nullable=False)
    node_id: int = Field(foreign_key="navigation_nodes.id", index=True, nullable=False)
    map_version_id: Optional[int] = Field(
        default=None, foreign_key="map_versions.id", index=True,
    )
    connector_type: str = Field(
        max_length=30, nullable=False
    )  # elevator, stairs, ramp, escalator
    name: Optional[str] = Field(default=None, max_length=255)
    available_direction: str = Field(
        default="both", max_length=10, nullable=False
    )  # up, down, both
    is_accessible: bool = Field(default=True, nullable=False)
    operational_status: str = Field(
        default="operational", max_length=30, nullable=False
    )  # operational, out_of_service, maintenance
    metadata_json: Optional[str] = Field(default=None)

    floor: Optional["Floor"] = Relationship()
    node: Optional["NavigationNode"] = Relationship()
