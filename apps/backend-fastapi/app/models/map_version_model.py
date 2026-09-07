from datetime import datetime
from typing import TYPE_CHECKING, Optional, List
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import DateTime
from .base import TimestampMixin

if TYPE_CHECKING:
    from .building_model import Building
    from .user_model import User


class MapVersion(TimestampMixin, table=True):
    __tablename__ = "map_versions"

    id: Optional[int] = Field(default=None, primary_key=True)
    building_id: int = Field(foreign_key="buildings.id", index=True, nullable=False)
    version_number: str = Field(
        max_length=50, index=True, nullable=False
    )  # semantic version, e.g. 2.4.1
    schema_version: str = Field(default="1.0", max_length=20, nullable=False)
    # Self-referential FK to track version lineage
    parent_version_id: Optional[int] = Field(
        default=None, foreign_key="map_versions.id", index=True,
    )
    status: str = Field(
        default="draft", max_length=20, nullable=False
    )  # draft, in_review, approved, published, archived, rolled_back
    reviewer_id: Optional[int] = Field(
        default=None, foreign_key="users.id", index=True,
    )
    release_notes: Optional[str] = None
    changelog: Optional[str] = None
    validation_report_json: Optional[str] = Field(default=None)
    size_bytes: Optional[int] = Field(default=0)
    published_at: Optional[datetime] = Field(
        default=None,
        sa_type=DateTime(timezone=True),
        sa_column_kwargs={"nullable": True},
    )

    building: Optional["Building"] = Relationship()
    reviewer: Optional["User"] = Relationship()
    navpacks: List["NavPack"] = Relationship(back_populates="map_version")


class NavPack(TimestampMixin, table=True):
    __tablename__ = "navpacks"

    id: Optional[int] = Field(default=None, primary_key=True)
    map_version_id: int = Field(
        foreign_key="map_versions.id", index=True, nullable=False
    )
    schema_version: str = Field(default="1.0", max_length=20, nullable=False)
    archive_uri: str = Field(max_length=500, nullable=False)   # local path or S3 URI
    archive_path: Optional[str] = Field(default=None, max_length=500)  # filesystem path
    checksum_sha256: str = Field(max_length=64, nullable=False)
    total_size_bytes: int = Field(nullable=False)
    signature_key_id: Optional[str] = Field(default=None, max_length=100)
    min_app_version: Optional[str] = Field(default="1.0.0", max_length=20)
    generated_at: Optional[datetime] = Field(
        default=None,
        sa_type=DateTime(timezone=True),
        sa_column_kwargs={"nullable": True},
    )

    map_version: Optional["MapVersion"] = Relationship(back_populates="navpacks")
