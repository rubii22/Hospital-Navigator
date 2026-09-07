# Base Model & Mixins
# Defines shared base class and timestamp mixin for SQLModel entities.
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import DateTime, func


class Base(SQLModel):
    """Base class that database models inherit from."""

    pass


class TimestampMixin(SQLModel):
    """Mixin for models requiring created_at and updated_at timestamps."""

    created_at: Optional[datetime] = Field(
        default=None,
        sa_type=DateTime(timezone=True),
        sa_column_kwargs={"server_default": func.now(), "nullable": False},
    )
    updated_at: Optional[datetime] = Field(
        default=None,
        sa_type=DateTime(timezone=True),
        sa_column_kwargs={
            "server_default": func.now(),
            "onupdate": func.now(),
            "nullable": False,
        },
    )
