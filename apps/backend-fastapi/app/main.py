from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import root_router
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — runs once at startup and shutdown.

    The API process must NOT start Redis, Celery, or any background
    workers.  Those are independently managed services (see
    ``docker-compose.dev.yml`` or run them in separate terminals).
    """
    print("\n🚀 [FastAPI Lifespan] API starting …")
    yield
    print("\n👋 [FastAPI Lifespan] API shutting down.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url="/api/v1/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=None if settings.TESTING else lifespan,
)

if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(root_router, prefix="/api")
