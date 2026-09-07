from datetime import datetime
from typing import Optional
from pydantic import EmailStr
from sqlmodel import SQLModel


class UserCreate(SQLModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None


class UserUpdate(SQLModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(SQLModel):
    id: int
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    is_active: bool
    is_superuser: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class UserPreferenceResponse(SQLModel):
    id: int
    user_id: int
    preferred_language: str
    voice_guidance_enabled: bool
    voice_language: str
    text_size: str
    high_contrast_enabled: bool
    route_mode: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class UserPreferenceUpdate(SQLModel):
    preferred_language: Optional[str] = None
    voice_guidance_enabled: Optional[bool] = None
    voice_language: Optional[str] = None
    text_size: Optional[str] = None
    high_contrast_enabled: Optional[bool] = None
    route_mode: Optional[str] = None

