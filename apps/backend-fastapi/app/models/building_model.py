from typing import TYPE_CHECKING, Optional, List
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampMixin

if TYPE_CHECKING:
    from .hospital_model import Hospital
    from .floor_model import Floor


class Building(TimestampMixin, table=True):
    __tablename__ = "buildings"

    id: Optional[int] = Field(default=None, primary_key=True)
    hospital_id: int = Field(foreign_key="hospitals.id", index=True, nullable=False)
    name: str = Field(max_length=255, nullable=False)
    code: str = Field(max_length=100, nullable=False)
    description: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str = Field(default="active", max_length=30, nullable=False)

    hospital: Optional["Hospital"] = Relationship(back_populates="buildings")
    floors: List["Floor"] = Relationship(
        back_populates="building",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
