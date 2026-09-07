from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from pydantic import BaseModel

from app.core.database import get_db
from app.models.hospital_model import Hospital
from app.models.map_version_model import MapVersion, NavPack
from app.models.mapping_job_model import MappingJob
from app.models.feedback_model import AuditLog

router = APIRouter()


class DashboardStatsResponse(BaseModel):
    active_hospitals: int
    published_versions: int
    navpacks_generated: int
    running_jobs: int
    publish_breakdown: Dict[str, int]
    recent_jobs: List[Dict[str, Any]]
    recent_activities: List[Dict[str, Any]]


@router.get("/dashboard-stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)) -> DashboardStatsResponse:
    hospitals_count = (
        db.exec(
            select(func.count(Hospital.id)).where(Hospital.status == "active")
        ).one()
        or 0
    )

    published_versions_count = (
        db.exec(
            select(func.count(MapVersion.id)).where(MapVersion.status == "published")
        ).one()
        or 0
    )

    total_versions = db.exec(select(func.count(MapVersion.id))).one() or 0
    in_review_versions = (
        db.exec(
            select(func.count(MapVersion.id)).where(MapVersion.status == "in_review")
        ).one()
        or 0
    )
    draft_versions = (
        db.exec(
            select(func.count(MapVersion.id)).where(MapVersion.status == "draft")
        ).one()
        or 0
    )

    navpacks_count = db.exec(select(func.count(NavPack.id))).one() or 0

    running_jobs_count = (
        db.exec(
            select(func.count(MappingJob.id)).where(
                MappingJob.status.in_(["pending", "processing"])
            )
        ).one()
        or 0
    )

    recent_jobs_models = db.exec(
        select(MappingJob).order_by(MappingJob.created_at.desc()).limit(5)
    ).all()

    recent_jobs = [
        {
            "id": f"JOB-{j.id:04d}",
            "raw_id": j.id,
            "floor_id": j.floor_id,
            "status": j.status,
            "pipeline_stage": j.pipeline_stage or "initializing",
            "progress": (
                100
                if j.status == "completed"
                else (65 if j.status == "processing" else 0)
            ),
            "created_at": j.created_at.isoformat() if j.created_at else "",
        }
        for j in recent_jobs_models
    ]

    recent_logs = db.exec(
        select(AuditLog).order_by(AuditLog.created_at.desc()).limit(6)
    ).all()

    activities = [
        {
            "id": log.id,
            "action": log.action,
            "entity": log.entity_name,
            "timestamp": log.created_at.isoformat() if log.created_at else "",
        }
        for log in recent_logs
    ]

    return DashboardStatsResponse(
        active_hospitals=hospitals_count,
        published_versions=published_versions_count,
        navpacks_generated=navpacks_count,
        running_jobs=running_jobs_count,
        publish_breakdown={
            "published": published_versions_count,
            "in_review": in_review_versions,
            "draft": draft_versions,
            "total": total_versions,
        },
        recent_jobs=recent_jobs,
        recent_activities=activities,
    )


@router.get("/activity-logs", response_model=List[Dict[str, Any]])
def get_activity_logs(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    logs = db.exec(
        select(AuditLog).order_by(AuditLog.created_at.desc()).limit(50)
    ).all()
    return [
        {
            "id": l.id,
            "user_id": l.user_id,
            "action": l.action,
            "entity_name": l.entity_name,
            "entity_id": l.entity_id,
            "created_at": l.created_at.isoformat() if l.created_at else "",
        }
        for l in logs
    ]
