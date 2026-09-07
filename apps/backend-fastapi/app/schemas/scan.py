from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


# --- Mapping Session Schemas ---
class MappingSessionBase(BaseModel):
    floor_id: int
    distance_walked: Optional[float] = 0.0
    duration_seconds: Optional[int] = 0
    frames_count: Optional[int] = 0
    points_captured_count: Optional[int] = 0
    coverage_percentage: Optional[float] = 0.0
    quality_rating: Optional[str] = "Medium"


class MappingSessionCreate(MappingSessionBase):
    pass


class MappingSessionUpdate(BaseModel):
    status: Optional[str] = None
    distance_walked: Optional[float] = None
    duration_seconds: Optional[int] = None
    frames_count: Optional[int] = None
    points_captured_count: Optional[int] = None
    coverage_percentage: Optional[float] = None
    quality_rating: Optional[str] = None


class MappingSessionResponse(MappingSessionBase):
    id: int
    uploaded_by: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Scan Asset Schemas ---
class ScanAssetBase(BaseModel):
    asset_type: str
    file_url: str
    size_bytes: Optional[int] = 0


class ScanAssetCreate(ScanAssetBase):
    pass


class ScanFrameUpload(BaseModel):
    image_base64: str
    frame_index: Optional[int] = 0


class ScanAssetResponse(ScanAssetBase):
    id: int
    session_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- AI Job Result Schemas ---
class AIJobResultBase(BaseModel):
    step: str
    progress_percentage: float
    status: str
    error_message: Optional[str] = None


class AIJobResultResponse(AIJobResultBase):
    id: int
    session_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Mapping Job Schemas ---
class MappingJobResponse(BaseModel):
    id: int
    session_id: Optional[int] = None
    floor_id: int
    uploaded_by: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class JobStatusResponse(BaseModel):
    job_id: int
    session_id: int
    status: str  # pending, in_progress, completed, failed
    current_stage: Optional[str] = None
    overall_progress: float = 0.0
    stages: List[AIJobResultResponse] = []
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class RetryStageRequest(BaseModel):
    stage_name: str
