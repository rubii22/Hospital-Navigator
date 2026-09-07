from sqlmodel import Session, create_engine
from app.core.celery_app import celery_app
from app.core.config import settings
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)


@celery_app.task(name="run_pipeline_job_task")
def run_pipeline_job_task(session_id: int, job_id: int):
    """
    Celery background worker task to execute the pipeline asynchronously.
    """
    from app.services.pipeline.orchestrator import PipelineOrchestrator

    with Session(engine) as db:
        return PipelineOrchestrator.run_pipeline(db, session_id, job_id)


@celery_app.task(name="retry_pipeline_stage_task")
def retry_pipeline_stage_task(session_id: int, job_id: int, stage_name: str):
    """
    Celery background worker task to re-run a specific pipeline stage.
    """
    from app.services.pipeline.orchestrator import PipelineOrchestrator

    with Session(engine) as db:
        return PipelineOrchestrator.run_pipeline(db, session_id, job_id)
