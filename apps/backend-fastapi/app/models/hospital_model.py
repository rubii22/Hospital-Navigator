from typing import TYPE_CHECKING, Optional, List
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampMixin

if TYPE_CHECKING:
    from .building_model import Building
    from .department_model import Department
    from .user_model import User


class Hospital(TimestampMixin, table=True):
    __tablename__ = "hospitals"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=255, nullable=False)
    code: str = Field(max_length=100, unique=True, index=True, nullable=False)
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = Field(default=None, max_length=50)
    email: Optional[str] = Field(default=None, max_length=255)
    website: Optional[str] = Field(default=None, max_length=500)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timezone: Optional[str] = Field(default=None, max_length=100)
    status: str = Field(default="active", max_length=30, nullable=False)
    owner_id: Optional[int] = Field(default=None, foreign_key="users.id", nullable=True)

    buildings: List["Building"] = Relationship(back_populates="hospital")
    departments: List["Department"] = Relationship(back_populates="hospital")
    emergency_contacts: List["EmergencyContact"] = Relationship(
        back_populates="hospital"
    )
    owner: Optional["User"] = Relationship(back_populates="hospitals")



class EmergencyContact(TimestampMixin, table=True):
    __tablename__ = "emergency_contacts"

    id: Optional[int] = Field(default=None, primary_key=True)
    hospital_id: int = Field(foreign_key="hospitals.id", index=True, nullable=False)
    title: str = Field(
        max_length=150, nullable=False
    )  # e.g., Hospital Reception, Ambulance, Emergency Room
    phone_number: str = Field(max_length=50, nullable=False)
    is_active: bool = Field(default=True, nullable=False)

    hospital: Optional["Hospital"] = Relationship(back_populates="emergency_contacts")
