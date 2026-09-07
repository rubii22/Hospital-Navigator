"""Test-only configuration isolated from a developer or deployment shell.

Pydantic settings prioritise process environment over the local ``.env`` file.
A deployment shell may legitimately set DEBUG to a non-boolean environment
label (for example, ``release``).  Tests need a deterministic boolean value
before importing the FastAPI application.
"""

import os

os.environ["DEBUG"] = "false"
os.environ["TESTING"] = "true"

# Use a deterministic SQLite database for testing.  The real PostgreSQL
# credentials in ``.env`` are never touched.
os.environ.setdefault(
    "DATABASE_URL", "sqlite:///./test.db"
)
os.environ.setdefault(
    "ASYNC_DATABASE_URL", "sqlite+aiosqlite:///./test.db"
)
os.environ.setdefault("SECRET_KEY", "test-secret-key-not-for-production")

import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import get_db


# In-memory SQLite engine shared by all tests via StaticPool.
_test_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


@pytest.fixture(name="session", autouse=False)
def session_fixture():
    """Create tables and yield a DB session backed by in-memory SQLite."""
    SQLModel.metadata.create_all(_test_engine)
    with Session(_test_engine) as session:
        yield session
    SQLModel.metadata.drop_all(_test_engine)


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """Provide a TestClient with the database overridden to the test session."""

    def get_db_override():
        return session

    app.dependency_overrides[get_db] = get_db_override
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()
