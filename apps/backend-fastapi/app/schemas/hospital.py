from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel


# Emergency Contact Schemas
class EmergencyContactBase(SQLModel):
    title: str
    phone_number: str
    is_active: bool = True


class EmergencyContactCreate(EmergencyContactBase):
    pass


class EmergencyContactResponse(EmergencyContactBase):
    id: int
    hospital_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# Hospital Schemas
class HospitalBase(SQLModel):
    name: str
    code: str
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timezone: Optional[str] = None
    status: str = "active"
    owner_id: Optional[int] = None



class HospitalCreate(HospitalBase):
    pass


class HospitalUpdate(SQLModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timezone: Optional[str] = None
    status: Optional[str] = None


class HospitalResponse(HospitalBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# Building Schemas
class BuildingBase(SQLModel):
    name: str
    code: str
    description: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str = "active"


class BuildingCreate(BuildingBase):
    pass


class BuildingUpdate(SQLModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: Optional[str] = None


class BuildingResponse(BuildingBase):
    id: int
    hospital_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# Floor Schemas
class FloorBase(SQLModel):
    name: str
    floor_number: int
    display_name: Optional[str] = None
    description: Optional[str] = None
    map_width: Optional[float] = None
    map_height: Optional[float] = None
    elevation: Optional[float] = None
    status: str = "active"


class FloorCreate(FloorBase):
    pass


class FloorUpdate(SQLModel):
    name: Optional[str] = None
    floor_number: Optional[int] = None
    display_name: Optional[str] = None
    description: Optional[str] = None
    map_width: Optional[float] = None
    map_height: Optional[float] = None
    elevation: Optional[float] = None
    status: Optional[str] = None


class FloorResponse(FloorBase):
    id: int
    building_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# Room Schemas
class RoomBase(SQLModel):
    name: str
    room_number: Optional[str] = None
    room_type: str = "general"
    status: str = "active"


class RoomCreate(RoomBase):
    department_id: Optional[int] = None


class RoomUpdate(SQLModel):
    name: Optional[str] = None
    room_number: Optional[str] = None
    room_type: Optional[str] = None
    status: Optional[str] = None
    department_id: Optional[int] = None


class RoomResponse(RoomBase):
    id: int
    floor_id: int
    department_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# Department Schemas
class DepartmentBase(SQLModel):
    name: str
    code: Optional[str] = None
    description: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    status: str = "active"


class DepartmentCreate(DepartmentBase):
    building_id: Optional[int] = None
    floor_id: Optional[int] = None
    parent_department_id: Optional[int] = None


class DepartmentUpdate(SQLModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    status: Optional[str] = None
    building_id: Optional[int] = None
    floor_id: Optional[int] = None
    parent_department_id: Optional[int] = None


class DepartmentResponse(DepartmentBase):
    id: int
    hospital_id: int
    building_id: Optional[int] = None
    floor_id: Optional[int] = None
    parent_department_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
