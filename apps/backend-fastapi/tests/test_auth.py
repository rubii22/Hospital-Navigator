import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session, select

from app.main import app
from app.core.database import get_db
from app.models.user_model import User, UserPreference, UserRole, Role
from sqlalchemy.pool import StaticPool
from app.core.security import create_refresh_token

# SQLite test database URL
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

# Create SQLite engine with StaticPool to share connection in-memory
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


@pytest.fixture(name="session")
def session_fixture():
    # Only create tables related to users and preferences to avoid PostGIS requirements
    tables_to_create = [
        User.__table__,
        UserPreference.__table__,
        UserRole.__table__,
        Role.__table__,
    ]
    SQLModel.metadata.create_all(engine, tables=tables_to_create)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine, tables=tables_to_create)


@pytest.fixture(name="client")
def client_fixture(session):
    def get_db_override():
        return session

    app.dependency_overrides[get_db] = get_db_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


def test_register_user(client: TestClient, session: Session):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "testuser@example.com",
            "password": "securepassword",
            "full_name": "Test User",
            "phone": "+1234567890",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "testuser@example.com"
    assert data["full_name"] == "Test User"
    assert data["phone"] == "+1234567890"
    assert "id" in data

    # Verify preference was created
    user_id = data["id"]
    db_pref = session.exec(
        select(UserPreference).where(UserPreference.user_id == user_id)
    ).first()
    assert db_pref is not None
    assert db_pref.preferred_language == "en"


def test_register_user_duplicate_email(client: TestClient):
    payload = {
        "email": "dup@example.com",
        "password": "password123",
        "full_name": "Duplicate User",
    }
    # Register first time
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201

    # Register second time
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"


def test_login_oauth2_form(client: TestClient):
    # Register user
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "loginform@example.com",
            "password": "testpassword",
            "full_name": "Form Login User",
        },
    )

    # Login using OAuth2 form parameters
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "loginform@example.com", "password": "testpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


def test_login_json(client: TestClient):
    # Register user
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "loginjson@example.com",
            "password": "testpassword",
            "full_name": "JSON Login User",
        },
    )

    # Login using JSON body
    response = client.post(
        "/api/v1/auth/login/json",
        json={"email": "loginjson@example.com", "password": "testpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_login_incorrect_credentials(client: TestClient):
    response = client.post(
        "/api/v1/auth/login/json",
        json={"email": "nonexistent@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"


def test_refresh_token_valid(client: TestClient):
    # Register user
    reg_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "refresh@example.com",
            "password": "password123",
            "full_name": "Refresh User",
        },
    )
    user_id = reg_response.json()["id"]

    # Generate test refresh token manually
    ref_token = create_refresh_token(subject=user_id)

    response = client.post("/api/v1/auth/refresh", json={"refresh_token": ref_token})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_refresh_token_invalid(client: TestClient):
    response = client.post(
        "/api/v1/auth/refresh", json={"refresh_token": "invalid_refresh_token"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid refresh token"


def test_logout(client: TestClient):
    response = client.post("/api/v1/auth/logout")
    assert response.status_code == 200
    assert response.json() == {"detail": "Successfully logged out"}


def test_get_current_user_profile(client: TestClient):
    # Register
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "profile@example.com",
            "password": "password123",
            "full_name": "Profile User",
        },
    )

    # Login to get token
    login_response = client.post(
        "/api/v1/auth/login/json",
        json={"email": "profile@example.com", "password": "password123"},
    )
    token = login_response.json()["access_token"]

    # Retrieve profile
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "profile@example.com"
    assert data["full_name"] == "Profile User"
