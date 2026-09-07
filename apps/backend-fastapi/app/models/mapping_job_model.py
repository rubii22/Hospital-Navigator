from datetime import datetime
from typing import TYPE_CHECKING, Optional
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, DateTime, func
from .base import TimestampMixin

if TYPE_CHECKING:
    from .floor_model import Floor
    from .mapping_session_model import MappingSession


class MappingJob(TimestampMixin, table=True):
    __tablename__ = "mapping_jobs"

    id: Optional[int] = Field(default=None, primary_key=True)
    floor_id: int = Field(foreign_key="floors.id", nullable=False)
    # Link to the mapping session that triggered this job (fixes P1 finding).
    session_id: Optional[int] = Field(
        default=None, foreign_key="mapping_sessions.id", index=True,
    )
    uploaded_by: int = Field(foreign_key="users.id", nullable=False)
    status: str = Field(
        default="pending", max_length=30, nullable=False
    )  # pending, processing, completed, failed, validation_failed
    pipeline_stage: Optional[str] = Field(default=None, max_length=50)
    error_message: Optional[str] = Field(default=None)
    # JSON dict of persisted artifact paths per stage, e.g.
    # {"point_cloud": "storage/artifacts/1/point_cloud.json", ...}
    artifacts_json: Optional[str] = Field(default=None)

    floor: Optional["Floor"] = Relationship()
    session: Optional["MappingSession"] = Relationship(back_populates="jobs")