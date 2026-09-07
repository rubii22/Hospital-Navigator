from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class MapVersionBase(BaseModel):
    building_id: int
    version_number: str
    schema_version: str = "1.0"
    parent_version_id: Optional[int] = None
    status: str = "draft"
    release_notes: Optional[str] = None
    changelog: Optional[str] = None
    validation_report_json: Optional[str] = None
    size_bytes: Optional[int] = 0


class MapVersionCreate(MapVersionBase):
    pass


class MapVersionUpdate(BaseModel):
    status: Optional[str] = None
    release_notes: Optional[str] = None
    changelog: Optional[str] = None
    validation_report_json: Optional[str] = None
    size_bytes: Optional[int] = None


class MapVersionResponse(MapVersionBase):
    id: int
    reviewer_id: Optional[int] = None
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class NavPackBase(BaseModel):
    map_version_id: int
    schema_version: str = "1.0"
    archive_uri: str
    archive_path: Optional[str] = None
    checksum_sha256: str
    total_size_bytes: int
    signature_key_id: Optional[str] = None
    min_app_version: Optional[str] = "1.0.0"


class NavPackCreate(NavPackBase):
    pass


class NavPackResponse(NavPackBase):
    id: int
    generated_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
