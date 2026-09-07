from typing import TYPE_CHECKING, Optional, List
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampMixin

if TYPE_CHECKING:
    from .floor_model import Floor
    from .user_model import User
    from .mapping_job_model import MappingJob


class MappingSession(TimestampMixin, table=True):
    __tablename__ = "mapping_sessions"

    id: Optional[int] = Field(default=None, primary_key=True)
    floor_id: int = Field(foreign_key="floors.id", index=True, nullable=False)
    uploaded_by: int = Field(foreign_key="users.id", index=True, nullable=False)
    status: str = Field(default="pending", max_length=30, nullable=False)  # pending, scanning, uploading, processing, completed, failed

    # ── PROTOTYPE PLACEHOLDERS ──────────────────────────────────────
    # The following metrics are populated by the extractor UI but are
    # NOT verified by real measurement.  They must be labelled as
    # simulated in any user-facing display until a genuine spatial
    # capture pipeline replaces them.
    distance_walked: Optional[float] = Field(default=0.0)  # meters (PROTOTYPE — not measured)
    duration_seconds: Optional[int] = Field(default=0)
    frames_count: Optional[int] = Field(default=0)
    points_captured_count: Optional[int] = Field(default=0)  # (PROTOTYPE — not measured)
    coverage_percentage: Optional[float] = Field(default=0.0)  # (PROTOTYPE — not measured)
    quality_rating: Optional[str] = Field(default="Medium", max_length=20)  # (PROTOTYPE — not measured)

    assets: List["ScanAsset"] = Relationship(back_populates="session")
    ai_results: List["AIJobResult"] = Relationship(back_populates="session")
    object_detections: List["ObjectDetection"] = Relationship(back_populates="session")
    ocr_detections: List["OCRDetection"] = Relationship(back_populates="session")
    jobs: List["MappingJob"] = Relationship(back_populates="session")


class ScanAsset(TimestampMixin, table=True):
    __tablename__ = "scan_assets"

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="mapping_sessions.id", index=True, nullable=False)
    asset_type: str = Field(max_length=50, nullable=False)  # frames, depth, imu, point_cloud, metadata
    file_url: str = Field(max_length=500, nullable=False)
    size_bytes: Optional[int] = Field(default=0)

    session: Optional["MappingSession"] = Relationship(back_populates="assets")


class AIJobResult(TimestampMixin, table=True):
    __tablename__ = "ai_job_results"

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="mapping_sessions.id", index=True, nullable=False)
    step: str = Field(max_length=50, nullable=False)  # point_cloud, object_detection, ocr_recognition, geometry_extraction, map_generation
    progress_percentage: float = Field(default=0.0, nullable=False)
    status: str = Field(default="pending", max_length=30, nullable=False)  # pending, in_progress, completed, failed
    error_message: Optional[str] = None

    session: Optional["MappingSession"] = Relationship(back_populates="ai_results")


class ObjectDetection(TimestampMixin, table=True):
    __tablename__ = "object_detections"

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="mapping_sessions.id", index=True, nullable=False)
    floor_id: int = Field(foreign_key="floors.id", index=True, nullable=False)
    class_name: str = Field(max_length=100, nullable=False)  # door, sign, obstacle, room_boundary
    confidence: float = Field(nullable=False)
    centroid_x: float = Field(nullable=False)
    centroid_y: float = Field(nullable=False)
    centroid_z: Optional[float] = Field(default=0.0)
    bounding_box_json: Optional[str] = None  # 3D bounding box dimensions/coordinates

    session: Optional["MappingSession"] = Relationship(back_populates="object_detections")


class OCRDetection(TimestampMixin, table=True):
    __tablename__ = "ocr_detections"

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="mapping_sessions.id", index=True, nullable=False)
    floor_id: int = Field(foreign_key="floors.id", index=True, nullable=False)
    detected_text: str = Field(max_length=255, nullable=False)
    category: str = Field(max_length=50, nullable=False)  # department, room_number, sign
    confidence: float = Field(nullable=False)
    status: str = Field(default="pending", max_length=30, nullable=False)  # pending, accepted, rejected

    session: Optional["MappingSession"] = Relationship(back_populates="ocr_detections")
