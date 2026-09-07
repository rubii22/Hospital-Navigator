import time
from typing import Dict, Any, List
from sqlmodel import Session, select
from datetime import datetime, timezone

from app.models.mapping_session_model import MappingSession, AIJobResult, ObjectDetection, OCRDetection
from app.models.mapping_job_model import MappingJob

from app.services.reconstruction.reconstruction_service import ReconstructionService
from app.services.perception.object_detector import ObjectDetectorService
from app.services.perception.ocr_service import OCRService
from app.services.spatial.geometry_service import GeometryService
from app.services.spatial.fusion_service import SpatialFusionService
from app.services.navigation.graph_builder import GraphBuilderService
from app.services.validation.map_validator import MapValidatorService
from app.services.compiler.map_compiler import MapCompilerService


class PipelineOrchestrator:
    @staticmethod
    def run_pipeline(db: Session, session_id: int, job_id: int) -> bool:
        """
        Sequentially executes all stages of the hospital mapping pipeline,
        updating stage progress in the database and generating artifacts.
        """
        db_job = db.get(MappingJob, job_id)
        db_session = db.get(MappingSession, session_id)
        if not db_job or not db_session:
            return False

        steps = [
            "point_cloud",
            "object_detection",
            "ocr_recognition",
            "geometry_extraction",
            "map_generation"
        ]

        try:
            db_job.status = "in_progress"
            db_session.status = "processing"
            db.add(db_job)
            db.add(db_session)
            db.commit()

            # Helper to update step result status
            def update_step(step_name: str, progress: float, status: str, err: str = None):
                stmt = select(AIJobResult).where(
                    AIJobResult.session_id == session_id,
                    AIJobResult.step == step_name
                )
                res = db.exec(stmt).first()
                if res:
                    res.progress_percentage = progress
                    res.status = status
                    if err:
                        res.error_message = err
                    db.add(res)
                    db.commit()

            # Step 1: Point Cloud Reconstruction
            update_step("point_cloud", 30.0, "in_progress")
            pc_artifact = ReconstructionService.process_point_cloud(session_id)
            time.sleep(0.5)
            update_step("point_cloud", 100.0, "completed")

            # Step 2: 3D Object Detection
            update_step("object_detection", 40.0, "in_progress")
            det_artifact = ObjectDetectorService.detect_objects(session_id, db_session.floor_id)
            # Store in DB
            for d in det_artifact.detections:
                stmt_exist = select(ObjectDetection).where(
                    ObjectDetection.session_id == session_id,
                    ObjectDetection.class_name == d.class_name
                )
                if not db.exec(stmt_exist).first():
                    db.add(ObjectDetection(
                        session_id=session_id,
                        floor_id=db_session.floor_id,
                        class_name=d.class_name,
                        confidence=d.confidence,
                        centroid_x=d.centroid_x,
                        centroid_y=d.centroid_y,
                        centroid_z=d.centroid_z,
                        bounding_box_json=d.bounding_box_json
                    ))
            db.commit()
            time.sleep(0.5)
            update_step("object_detection", 100.0, "completed")

            # Step 3: OCR Recognition
            update_step("ocr_recognition", 50.0, "in_progress")
            ocr_artifact = OCRService.detect_ocr_text(session_id, db_session.floor_id)
            for o in ocr_artifact.items:
                stmt_exist = select(OCRDetection).where(
                    OCRDetection.session_id == session_id,
                    OCRDetection.detected_text == o.detected_text
                )
                if not db.exec(stmt_exist).first():
                    db.add(OCRDetection(
                        session_id=session_id,
                        floor_id=db_session.floor_id,
                        detected_text=o.detected_text,
                        category=o.category,
                        confidence=o.confidence,
                        status="pending"
                    ))
            db.commit()
            time.sleep(0.5)
            update_step("ocr_recognition", 100.0, "completed")

            # Step 4: Spatial Geometry & Wall RANSAC
            update_step("geometry_extraction", 60.0, "in_progress")
            geom_data = GeometryService.extract_geometry(session_id, db_session.floor_id)
            building_model = SpatialFusionService.fuse_building_model(
                session_id, db_session.floor_id, geom_data, det_artifact, ocr_artifact
            )
            time.sleep(0.5)
            update_step("geometry_extraction", 100.0, "completed")

            # Step 5: Navigation Graph & Map Compilation
            update_step("map_generation", 70.0, "in_progress")
            vector_map = GraphBuilderService.build_navigation_graph(session_id, db_session.floor_id)
            val_report = MapValidatorService.validate_map(vector_map)
            map_manifest = MapCompilerService.compile_navpack(session_id, building_model, vector_map)
            time.sleep(0.5)
            update_step("map_generation", 100.0, "completed")

            # Finalize Job
            db_job.status = "completed"
            db_session.status = "completed"
            db.add(db_job)
            db.add(db_session)
            db.commit()
            return True

        except Exception as e:
            db_job.status = "failed"
            db_session.status = "failed"
            db.add(db_job)
            db.add(db_session)
            db.commit()
            raise e
