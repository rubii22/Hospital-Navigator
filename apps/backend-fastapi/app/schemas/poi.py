from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime


class POICategoryBase(BaseModel):
    name: str
    code: str
    icon: Optional[str] = None
    color: Optional[str] = None


class POICategoryCreate(POICategoryBase):
    pass


class POICategoryResponse(POICategoryBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class POIBase(BaseModel):
    name: str
    code: Optional[str] = None
    description: Optional[str] = None
    poi_type: str = "general"
    category_id: int
    hospital_id: int
    building_id: Optional[int] = None
    floor_id: int
    department_id: Optional[int] = None
    room_id: Optional[int] = None
    location_geometry: Optional[str] = None
    aliases_json: Optional[str] = None
    is_accessible: bool = True
    review_state: str = "approved"
    status: str = "active"


class POICreate(POIBase):
    pass


class POIUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    poi_type: Optional[str] = None
    category_id: Optional[int] = None
    department_id: Optional[int] = None
    room_id: Optional[int] = None
    location_geometry: Optional[str] = None
    aliases_json: Optional[str] = None
    is_accessible: Optional[bool] = None
    review_state: Optional[str] = None
    status: Optional[str] = None


class POIResponse(POIBase):
    id: int
    stable_uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
