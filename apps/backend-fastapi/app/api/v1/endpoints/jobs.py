from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.user_model import User
from app.models.mapping_job_model import MappingJob
from app.models.mapping_session_model import AIJobResult
from app.schemas.scan import JobStatusResponse, AIJobResultResponse, RetryStageRequest
from app.services.scan_service import ScanService

router = APIRouter()


@router.get("/{job_id}", response_model=JobStatusResponse)
def get_job_details(
    job_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> JobStatusResponse:
    job = db.get(MappingJob, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mapping job not found")

    # Fetch stages
    stmt = select(AIJobResult).where(AIJobResult.session_id == (job.session_id or job.id))
    stages = list(db.exec(stmt).all())
    completed_count = sum(1 for s in stages if s.status == "completed")
    overall = round((completed_count / max(len(stages), 1)) * 100, 1)

    in_prog = next((s.step for s in stages if s.status == "in_progress"), None)

    return JobStatusResponse(
        job_id=job.id,
        session_id=job.session_id or job.id,
        status=job.status,
        current_stage=in_prog,
        overall_progress=overall,
        stages=[AIJobResultResponse.model_validate(s) for s in stages],
        created_at=job.created_at,
        updated_at=job.updated_at
    )


@router.post("/{job_id}/retry", response_model=JobStatusResponse)
def retry_job_stage(
    job_id: int,
    req: RetryStageRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> JobStatusResponse:
    job = db.get(MappingJob, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mapping job not found")

    # Trigger retry
    session_id = job.session_id or job.id
    try:
        from app.workers.pipeline_tasks import retry_pipeline_stage_task
        retry_pipeline_stage_task.delay(session_id, job_id, req.stage_name)
    except Exception:
        ScanService.start_ai_job(db, session_id, current_user.id)

    return get_job_details(job_id, current_user, db)
