from datetime import datetime, timezone
from typing import Optional, List
from sqlmodel import Session, select

from app.models.mapping_session_model import (
    MappingSession,
    ScanAsset,
    AIJobResult,
    ObjectDetection,
    OCRDetection,
)
from app.models.mapping_job_model import MappingJob
from app.schemas.scan import MappingSessionCreate, ScanAssetCreate
from app.schemas.map import (
    PointCloudArtifact,
    VectorMapData,
    NavigationNodeSchema,
    NavigationEdgeSchema,
)
from app.schemas.perception import (
    ObjectDetectionResponse,
    OCRDetectionResponse,
    OCRDetectionUpdate,
)

from app.services.pipeline.orchestrator import PipelineOrchestrator
from app.services.reconstruction.reconstruction_service import ReconstructionService
from app.services.navigation.graph_builder import GraphBuilderService


from pathlib import Path
import json
import logging
from app.models.room_model import Room

logger = logging.getLogger(__name__)


class ScanService:
    @staticmethod
    def create_session(
        db: Session, user_id: int, session_in: MappingSessionCreate
    ) -> MappingSession:
        from app.models.floor_model import Floor

        target_floor_id = session_in.floor_id
        floor = db.get(Floor, target_floor_id)
        if not floor:
            first_floor = db.exec(select(Floor).order_by(Floor.id.asc())).first()
            if first_floor:
                target_floor_id = first_floor.id

        db_session = MappingSession(
            floor_id=target_floor_id,
            uploaded_by=user_id,
            status="pending",
            distance_walked=session_in.distance_walked,
            duration_seconds=session_in.duration_seconds,
            frames_count=session_in.frames_count,
            points_captured_count=session_in.points_captured_count,
            coverage_percentage=session_in.coverage_percentage,
            quality_rating=session_in.quality_rating,
        )
        db.add(db_session)
        db.commit()
        db.refresh(db_session)
        return db_session

    @staticmethod
    def get_session(db: Session, session_id: int) -> Optional[MappingSession]:
        return db.get(MappingSession, session_id)

    @staticmethod
    def list_user_sessions(db: Session, user_id: int) -> List[MappingSession]:
        stmt = (
            select(MappingSession)
            .where(MappingSession.uploaded_by == user_id)
            .order_by(MappingSession.created_at.desc())
        )
        return list(db.exec(stmt).all())

    @staticmethod
    def add_asset(db: Session, session_id: int, asset_in: ScanAssetCreate) -> ScanAsset:
        db_asset = ScanAsset(
            session_id=session_id,
            asset_type=asset_in.asset_type,
            file_url=asset_in.file_url,
            size_bytes=asset_in.size_bytes,
        )
        db.add(db_asset)
        db.commit()
        db.refresh(db_asset)
        return db_asset

    @staticmethod
    def save_frame_image(
        db: Session, session_id: int, image_base64: str, frame_index: int = 0
    ) -> ScanAsset:
        import os
        import base64

        try:
            if "," in image_base64:
                image_base64 = image_base64.split(",", 1)[1]
            data = base64.b64decode(image_base64)
        except Exception as e:
            logger.warning(f"Failed to decode base64 image frame: {e}")
            data = b""

        storage_dir = os.path.join(
            os.path.dirname(
                os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            ),
            "storage",
            "scans",
            str(session_id),
        )
        os.makedirs(storage_dir, exist_ok=True)

        file_path = os.path.join(storage_dir, f"frame_{frame_index}.jpg")
        try:
            with open(file_path, "wb") as f:
                f.write(data)
        except Exception as e:
            logger.warning(f"Failed to write frame to file: {e}")

        db_asset = ScanAsset(
            session_id=session_id,
            asset_type="keyframe",
            file_url=file_path,
            size_bytes=len(data),
        )
        db.add(db_asset)
        db.commit()
        db.refresh(db_asset)
        return db_asset

    @staticmethod
    def start_ai_job(
        db: Session, session_id: int, user_id: int
    ) -> Optional[MappingJob]:
        db_session = db.get(MappingSession, session_id)
        if not db_session:
            return None

        # Update session status
        db_session.status = "processing"
        db.add(db_session)

        # Create Mapping Job
        db_job = MappingJob(
            floor_id=db_session.floor_id, uploaded_by=user_id, status="processing"
        )
        db.add(db_job)
        db.commit()
        db.refresh(db_job)

        # Initialize AI Job Results (the 5 steps)
        steps = [
            "point_cloud",
            "object_detection",
            "ocr_recognition",
            "geometry_extraction",
            "map_generation",
        ]
        for step in steps:
            db_res = AIJobResult(
                session_id=session_id,
                step=step,
                progress_percentage=0.0,
                status="pending",
            )
            db.add(db_res)
        db.commit()

        # Try async Celery task execution, fallback to synchronous orchestrator run
        try:
            from app.workers.pipeline_tasks import run_pipeline_job_task

            run_pipeline_job_task.delay(session_id, db_job.id)
        except Exception:
            # Synchronous execution fallback
            PipelineOrchestrator.run_pipeline(db, session_id, db_job.id)

        return db_job

    @staticmethod
    def get_job_progress(db: Session, session_id: int) -> List[AIJobResult]:
        stmt_results = select(AIJobResult).where(AIJobResult.session_id == session_id)
        results = list(db.exec(stmt_results).all())
        if not results:
            # Run pipeline sync if not initialized
            db_session = db.get(MappingSession, session_id)
            if db_session:
                db_job = MappingJob(
                    floor_id=db_session.floor_id,
                    uploaded_by=db_session.uploaded_by,
                    status="processing",
                )
                db.add(db_job)
                db.commit()
                db.refresh(db_job)

                steps = [
                    "point_cloud",
                    "object_detection",
                    "ocr_recognition",
                    "geometry_extraction",
                    "map_generation",
                ]
                for step in steps:
                    db.add(
                        AIJobResult(
                            session_id=session_id,
                            step=step,
                            progress_percentage=0.0,
                            status="pending",
                        )
                    )
                db.commit()
                PipelineOrchestrator.run_pipeline(db, session_id, db_job.id)
                results = list(db.exec(stmt_results).all())
        elif all(r.status == "pending" for r in results):
            # Previous queued task was missed by worker; execute now
            db_session = db.get(MappingSession, session_id)
            if db_session:
                stmt_job = (
                    select(MappingJob)
                    .where(MappingJob.floor_id == db_session.floor_id)
                    .order_by(MappingJob.id.desc())
                )
                db_job = db.exec(stmt_job).first()
                job_id = db_job.id if db_job else 1
                try:
                    from app.workers.pipeline_tasks import run_pipeline_job_task

                    run_pipeline_job_task.delay(session_id, job_id)
                except Exception:
                    PipelineOrchestrator.run_pipeline(db, session_id, job_id)

        return results

    @staticmethod
    def get_object_detections(db: Session, session_id: int) -> List[ObjectDetection]:
        stmt = select(ObjectDetection).where(ObjectDetection.session_id == session_id)
        results = list(db.exec(stmt).all())
        if not results:
            db_session = db.get(MappingSession, session_id)
            floor_id = db_session.floor_id if db_session else 1
            from app.services.perception.object_detector import ObjectDetectorService

            art = ObjectDetectorService.detect_objects(session_id, floor_id)
            for d in art.detections:
                obj = ObjectDetection(
                    session_id=session_id,
                    floor_id=floor_id,
                    class_name=d.class_name,
                    confidence=d.confidence,
                    centroid_x=d.centroid_x,
                    centroid_y=d.centroid_y,
                    centroid_z=d.centroid_z,
                    bounding_box_json=d.bounding_box_json,
                )
                db.add(obj)
            db.commit()
            results = list(db.exec(stmt).all())
        return results

    @staticmethod
    def get_ocr_detections(db: Session, session_id: int) -> List[OCRDetection]:
        stmt = select(OCRDetection).where(OCRDetection.session_id == session_id)
        results = list(db.exec(stmt).all())
        if not results:
            db_session = db.get(MappingSession, session_id)
            floor_id = db_session.floor_id if db_session else 1
            from app.services.perception.ocr_service import OCRService

            art = OCRService.detect_ocr_text(session_id, floor_id)
            for o in art.items:
                ocr_obj = OCRDetection(
                    session_id=session_id,
                    floor_id=floor_id,
                    detected_text=o.detected_text,
                    category=o.category,
                    confidence=o.confidence,
                    status=o.status,
                )
                db.add(ocr_obj)
            db.commit()
            results = list(db.exec(stmt).all())
        return results

    @staticmethod
    def update_ocr_detection(
        db: Session, session_id: int, ocr_id: int, ocr_in: OCRDetectionUpdate
    ) -> Optional[OCRDetection]:
        ocr_item = db.get(OCRDetection, ocr_id)
        if not ocr_item or ocr_item.session_id != session_id:
            return None
        if ocr_in.status is not None:
            ocr_item.status = ocr_in.status
        if ocr_in.detected_text is not None:
            ocr_item.detected_text = ocr_in.detected_text
        if ocr_in.category is not None:
            ocr_item.category = ocr_in.category
        db.add(ocr_item)
        db.commit()
        db.refresh(ocr_item)
        return ocr_item

    @staticmethod
    def accept_all_ocr(db: Session, session_id: int) -> List[OCRDetection]:
        stmt = select(OCRDetection).where(OCRDetection.session_id == session_id)
        items = list(db.exec(stmt).all())
        for item in items:
            item.status = "accepted"
            db.add(item)
        db.commit()
        return items

    @staticmethod
    def get_point_cloud(session_id: int) -> PointCloudArtifact:
        return ReconstructionService.process_point_cloud(session_id)

    @staticmethod
    def get_map_data(session_id: int, floor_id: int = 1) -> VectorMapData:
        map_path = Path(f"storage/artifacts/map_data_{session_id}.json")
        if map_path.exists():
            try:
                with open(map_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                return VectorMapData.model_validate(data)
            except Exception as e:
                logger.warning(f"Failed to read saved map data for session {session_id}: {e}")
        return GraphBuilderService.build_navigation_graph(session_id, floor_id)

    @staticmethod
    def save_map_data(
        session_id: int, map_in: VectorMapData, db: Optional[Session] = None
    ) -> VectorMapData:
        try:
            map_dir = Path("storage/artifacts")
            map_dir.mkdir(parents=True, exist_ok=True)
            map_path = map_dir / f"map_data_{session_id}.json"
            with open(map_path, "w", encoding="utf-8") as f:
                json.dump(map_in.model_dump(), f, indent=2)
        except Exception as e:
            logger.warning(f"Failed to write vector map artifact for session {session_id}: {e}")

        # Sync rooms into DB if db session is provided
        if db and map_in.rooms:
            try:
                floor_id = map_in.floor_id or 1
                for r in map_in.rooms:
                    room_name = (
                        r.get("name") if isinstance(r, dict) else getattr(r, "name", None)
                    )
                    if room_name:
                        stmt = select(Room).where(
                            Room.floor_id == floor_id, Room.name == room_name
                        )
                        existing = db.exec(stmt).first()
                        if not existing:
                            new_room = Room(
                                floor_id=floor_id,
                                name=room_name,
                                room_type="general",
                                status="active",
                            )
                            db.add(new_room)
                db.commit()
            except Exception as e:
                logger.warning(f"Failed to sync rooms to DB: {e}")
                db.rollback()

        return map_in
