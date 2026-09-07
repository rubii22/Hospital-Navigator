from typing import TYPE_CHECKING, Optional, List
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampMixin

if TYPE_CHECKING:
    from .hospital_model import Hospital


class Role(SQLModel, table=True):
    __tablename__ = "roles"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=50, unique=True, index=True, nullable=False)
    description: Optional[str] = Field(default=None, max_length=255)

    user_roles: List["UserRole"] = Relationship(back_populates="role")


class UserRole(SQLModel, table=True):
    __tablename__ = "user_roles"

    user_id: int = Field(foreign_key="users.id", primary_key=True, index=True)
    role_id: int = Field(foreign_key="roles.id", primary_key=True, index=True)

    user: Optional["User"] = Relationship(back_populates="user_roles")
    role: Optional["Role"] = Relationship(back_populates="user_roles")


class User(TimestampMixin, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(max_length=255, unique=True, index=True, nullable=False)
    hashed_password: str = Field(max_length=255, nullable=False)
    full_name: str = Field(max_length=150, nullable=False)
    phone: Optional[str] = Field(default=None, max_length=50)
    is_active: bool = Field(default=True, nullable=False)
    is_superuser: bool = Field(default=False, nullable=False)

    user_roles: List["UserRole"] = Relationship(back_populates="user")
    preference: Optional["UserPreference"] = Relationship(back_populates="user")
    hospitals: List["Hospital"] = Relationship(back_populates="owner")



class UserPreference(TimestampMixin, table=True):
    __tablename__ = "user_preferences"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(
        foreign_key="users.id", unique=True, index=True, nullable=False
    )
    preferred_language: str = Field(default="en", max_length=10, nullable=False)
    voice_guidance_enabled: bool = Field(default=True, nullable=False)
    voice_language: str = Field(default="en-US", max_length=20, nullable=False)
    text_size: str = Field(
        default="normal", max_length=20, nullable=False
    )  # normal, medium, large
    high_contrast_enabled: bool = Field(default=False, nullable=False)
    route_mode: str = Field(
        default="normal", max_length=30, nullable=False
    )  # normal, wheelchair, no_stairs, nearest_elevator

    user: Optional["User"] = Relationship(back_populates="preference")
