# Hospital Navigator

An indoor navigation platform for hospitals. Two products share one published map package:

1. **Map Extractor** (`apps/map-extractor`) — an authenticated staff tool for importing floor plans, surveying buildings, editing routing data, placing QR anchors, validating, and publishing versioned map packages.
2. **Offline Navigator** (`apps/offile_navigator`) — a visitor/patient app that downloads an approved hospital package once, then searches, routes, and locates the visitor without a network connection.

## Architecture

```text
┌────────────────────────────────────────────────────────────────┐
│                     Turborepo Monorepo                        │
├──────────────────┬──────────────────┬──────────────────────────┤
│  map-extractor   │ offile_navigator │      admin-app           │
│  (Expo / RN)     │ (Expo / RN)      │  (Next.js — deferred)   │
├──────────────────┴──────────────────┴──────────────────────────┤
│                   backend-fastapi                              │
│  FastAPI + SQLModel + PostgreSQL + Celery + Redis              │
│  Services: auth, hospitals, scans, pipeline, validation,       │
│            navigation (A*), compiler (.navpack), map versions  │
└────────────────────────────────────────────────────────────────┘
```

### Backend services (`apps/backend-fastapi`)

| Service               | Role                                                       |
|----------------------|-------------------------------------------------------------|
| **API**              | FastAPI HTTP endpoints — hospitals, scans, navigator, maps  |
| **Worker**           | Celery background tasks — pipeline orchestration            |
| **Redis**            | Celery message broker and result backend                    |
| **PostgreSQL**       | Relational data store — hospitals, floors, graph, versions  |
| **Local storage**    | Scan frames, navpack archives, artifacts                    |

> **Important**: The API process must NOT spawn Redis or Celery workers. These are independently managed services. See `docker-compose.dev.yml` for the intended separation.

### Mobile apps

Both mobile apps use **Expo Router** with **React Native**. The navigator requires a custom development build (not Expo Go) for native modules (SQLite, filesystem, camera/QR).

## Local Development Setup

### Prerequisites

- Python 3.14+ with [uv](https://docs.astral.sh/uv/)
- Node.js 20+ with npm
- PostgreSQL 16+
- Redis 7+

### Backend

```bash
cd apps/backend-fastapi

# Install Python dependencies
uv sync

# Copy and configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
uv run alembic upgrade head

# Seed sample data (optional)
uv run python seed_db.py

# Start API server (does NOT start Redis/Celery)
uv run uvicorn main:app --reload --port 8000

# In a separate terminal — start Celery worker
uv run celery -A app.core.celery_app.celery_app worker --loglevel=info

# In a separate terminal — start Redis (if not running)
redis-server
```

### Navigator app

```bash
cd apps/offile_navigator
npm install
npx expo start
```

### Map Extractor app

```bash
cd apps/map-extractor
npm install
npx expo start
```

## Testing

```bash
cd apps/backend-fastapi
uv run pytest -q
```

Test mode uses an isolated SQLite in-memory database and forces deterministic settings (`DEBUG=false`, `TESTING=true`). Tests do not start Redis, Celery, or connect to PostgreSQL.

## Package Management

- **Python (backend)**: managed with `uv` — see `pyproject.toml`
- **TypeScript (mobile)**: managed with `npm` — each app has its own `package.json`
- **Monorepo orchestration**: Turborepo — see `turbo.json`

Do not add shared TypeScript packages without documenting versioning policy. Backend and mobile apps communicate via the REST API contract only.

## Documentation

- [Master Engineering Plan](docs/HOSPITAL_NAVIGATION_MASTER_PLAN.md) — source of truth for architecture, roadmap, and quality gates
- [Setup and Migrations](SETUP_AND_MIGRATIONS.md) — database setup guide

## License

Private — not open source.
