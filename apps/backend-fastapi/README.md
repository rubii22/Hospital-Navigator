# Backend FastAPI - Hospital Navigator

FastAPI backend service powering the Hospital Navigator indoor mapping, spatial pathfinding, positioning, and navigation systems.

---

## Quick Commands

### 1. Install Dependencies

```bash
uv sync
```

### 2. Environment Configuration

Create `.env` (copied from `.env.example`):

```env
DATABASE_URL="postgresql+psycopg2://postgres:iamhuzaifa@localhost:5432/hospital_navigator"
ASYNC_DATABASE_URL="postgresql+asyncpg://postgres:iamhuzaifa@localhost:5432/hospital_navigator"
```

### 3. Database Schema Creation

```bash
uv run python create_tables.py
```

### 4. Database Migrations (Alembic)

```bash
# Generate migration script
uv run alembic revision --autogenerate -m "Your migration message"

# Apply migration to database
uv run alembic upgrade head

# Check current revision
uv run alembic current
```

### 5. Run Server

```bash
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

For complete detailed documentation, see [SETUP_AND_MIGRATIONS.md](../../SETUP_AND_MIGRATIONS.md).
