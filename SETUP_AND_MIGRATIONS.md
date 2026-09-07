# Hospital Navigator - Setup, Running & Database Migrations Guide

Complete guide for setting up the environment, running PostgreSQL via Docker, initializing database tables, managing Alembic schema migrations, and running the FastAPI backend.

---

## 1. Quick Start Prerequisites

- **Python**: 3.14 or newer
- **Package Manager**: [`uv`](https://github.com/astral-sh/uv)
- **Container Runtime**: Docker

---

## 2. Docker Database Setup

Start a local PostgreSQL database container named `hospital_navigator`:

```bash
sudo docker run --name hospital_navigator \
  -e POSTGRES_PASSWORD=iamhuzaifa \
  -e POSTGRES_DB=hospital_navigator \
  -v pgdata:/var/lib/postgresql/data \
  -p 5432:5432 \
  -d postgres
```

### Database Connection Details
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `hospital_navigator`
- **User**: `postgres`
- **Password**: `iamhuzaifa`

---

## 3. Environment Variables Configuration

Create a `.env` file in `apps/backend-fastapi/.env` (and in project root):

```env
PROJECT_NAME="Hospital Navigator API"
ENVIRONMENT="development"
DEBUG=True

# Database Connection URLs
DATABASE_URL="postgresql+psycopg2://postgres:iamhuzaifa@localhost:5432/hospital_navigator"
ASYNC_DATABASE_URL="postgresql+asyncpg://postgres:iamhuzaifa@localhost:5432/hospital_navigator"

# Security & Tokens
SECRET_KEY="replace-this-with-a-secure-random-secret-key"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=60

# CORS Origins
BACKEND_CORS_ORIGINS="http://localhost:3000,http://localhost:8081"
```

---

## 4. Install Dependencies

Navigate to `apps/backend-fastapi` and sync all dependencies into the virtual environment (`.venv`):

```bash
cd apps/backend-fastapi
uv sync
```

---

## 5. IDE Python Interpreter Setup

To avoid linter/type errors in VS Code or Antigravity IDE:
1. Press `Ctrl + Shift + P` (or `Cmd + Shift + P` on macOS).
2. Search and select **`Python: Select Interpreter`**.
3. Choose: `apps/backend-fastapi/.venv/bin/python`.

---

## 6. Initial Database Schema Creation

Push all 26 SQLModel domain tables directly to your running Docker PostgreSQL database:

```bash
cd apps/backend-fastapi
uv run python create_tables.py
```

---

## 7. Alembic Database Schema Migrations

Alembic handles table modifications (adding columns, renaming fields, changing constraints) **without losing existing data**.

### When Do You Need Migrations?
- **Adding a new model file**: `create_tables.py` will create new tables automatically.
- **Changing existing tables** (adding fields, altering types, dropping columns): **Alembic migration is required**.

### Running Migration Commands

All commands should be executed from `apps/backend-fastapi/`:

#### A. Generate a New Migration Script
When you edit any file in `app/models/`:
```bash
cd apps/backend-fastapi
uv run alembic revision --autogenerate -m "Add new column to users table"
```

#### B. Apply Pending Migrations to PostgreSQL
Apply migration scripts up to the latest revision (`head`):
```bash
uv run alembic upgrade head
```

#### C. Useful Alembic Commands Reference
```bash
# View current database revision
uv run alembic current

# View migration history
uv run alembic history

# Rollback 1 migration step
uv run alembic downgrade -1

# Stamp database as current head without running scripts
uv run alembic stamp head
```

---

## 8. Running the Backend Server

Start the FastAPI application with auto-reload:

```bash
cd apps/backend-fastapi
uv run uvicorn main:app --reload --port 8000
```

Interactive API documentation will be available at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
