from fastapi import APIRouter
from app.api.v1.endpoints import auth, health, hospitals, users, scans, jobs, navigator, poi, versions, admin_stats

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(hospitals.router, prefix="/hospitals", tags=["hospitals"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(scans.router, prefix="/scans", tags=["scans"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(navigator.router, prefix="/navigator", tags=["navigator"])
api_router.include_router(poi.router, prefix="/pois", tags=["pois"])
api_router.include_router(versions.router, prefix="/versions", tags=["versions"])
api_router.include_router(admin_stats.router, prefix="/admin", tags=["admin"])


