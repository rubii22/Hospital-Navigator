from typing import TYPE_CHECKING, Optional, List
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampMixin

if TYPE_CHECKING:
    from .hospital_model import Hospital
    from .building_model import Building
    from .floor_model import Floor
    from .room_model import Room
    from .poi_model import PointOfInterest


class Department(TimestampMixin, table=True):
    __tablename__ = "departments"

    id: Optional[int] = Field(default=None, primary_key=True)
    hospital_id: int = Field(foreign_key="hospitals.id", index=True, nullable=False)
    building_id: Optional[int] = Field(
        default=None, foreign_key="buildings.id", index=True
    )
    floor_id: Optional[int] = Field(default=None, foreign_key="floors.id", index=True)
    parent_department_id: Optional[int] = Field(
        default=None, foreign_key="departments.id", index=True
    )
    name: str = Field(max_length=255, nullable=False)
    code: Optional[str] = Field(default=None, max_length=100)
    description: Optional[str] = None
    phone: Optional[str] = Field(default=None, max_length=50)
    email: Optional[str] = Field(default=None, max_length=255)
    status: str = Field(default="active", max_length=30, nullable=False)

    hospital: Optional["Hospital"] = Relationship(back_populates="departments")
    building: Optional["Building"] = Relationship()
    floor: Optional["Floor"] = Relationship(back_populates="departments")
    rooms: List["Room"] = Relationship(back_populates="department")
    pois: List["PointOfInterest"] = Relationship(back_populates="department")
