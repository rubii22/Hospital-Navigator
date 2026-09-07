from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class Point3D(BaseModel):
    x: float
    y: float
    z: float = 0.0


class ObjectDetectionBase(BaseModel):
    class_name: str
    confidence: float
    centroid_x: float
    centroid_y: float
    centroid_z: float = 0.0
    bounding_box_json: Optional[str] = None


class ObjectDetectionCreate(ObjectDetectionBase):
    session_id: int
    floor_id: int


class ObjectDetectionResponse(ObjectDetectionBase):
    id: int
    session_id: int
    floor_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DetectionArtifact(BaseModel):
    schema_version: str = "1.0"
    session_id: int
    floor_id: int
    detections: List[ObjectDetectionResponse]


class OCRDetectionBase(BaseModel):
    detected_text: str
    category: str
    confidence: float
    status: str = "pending"  # pending, accepted, rejected


class OCRDetectionCreate(OCRDetectionBase):
    session_id: int
    floor_id: int


class OCRDetectionUpdate(BaseModel):
    status: Optional[str] = None
    detected_text: Optional[str] = None
    category: Optional[str] = None


class OCRDetectionResponse(OCRDetectionBase):
    id: int
    session_id: int
    floor_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class OCRArtifact(BaseModel):
    schema_version: str = "1.0"
    session_id: int
    floor_id: int
    items: List[OCRDetectionResponse]
