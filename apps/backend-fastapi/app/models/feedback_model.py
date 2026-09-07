from typing import TYPE_CHECKING, Optional
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampMixin

if TYPE_CHECKING:
    from .user_model import User
    from .hospital_model import Hospital


class NavigationFeedback(TimestampMixin, table=True):
    __tablename__ = "navigation_feedbacks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)
    hospital_id: int = Field(foreign_key="hospitals.id", index=True, nullable=False)
    rating: int = Field(nullable=False)
    comment: Optional[str] = None
    from_node_id: Optional[int] = Field(default=None, foreign_key="navigation_nodes.id")
    to_node_id: Optional[int] = Field(default=None, foreign_key="navigation_nodes.id")

    user: Optional["User"] = Relationship()
    hospital: Optional["Hospital"] = Relationship()


class AuditLog(TimestampMixin, table=True):
    __tablename__ = "audit_logs"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)
    action: str = Field(max_length=100, index=True, nullable=False)
    entity_name: str = Field(max_length=100, index=True, nullable=False)
    entity_id: Optional[int] = Field(default=None, index=True)
    payload_json: Optional[str] = None

    user: Optional["User"] = Relationship()
