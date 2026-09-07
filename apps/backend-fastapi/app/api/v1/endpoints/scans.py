from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.user_model import User
from app.services.scan_service import ScanService
from app.schemas.scan import (
    MappingSessionCreate,
    MappingSessionResponse,
    ScanAssetCreate,
    ScanFrameUpload,
    ScanAssetResponse,
    AIJobResultResponse,
    MappingJobResponse,
)
from app.schemas.perception import (
    ObjectDetectionResponse,
    OCRDetectionResponse,
    OCRDetectionUpdate,
    DetectionArtifact,
    OCRArtifact,
)

from app.schemas.map import PointCloudArtifact, VectorMapData

router = APIRouter()


@router.get("/", response_model=List[MappingSessionResponse])
def list_sessions(
    current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)
) -> List[MappingSessionResponse]:
    return ScanService.list_user_sessions(db, current_user.id)


@router.post(
    "/", response_model=MappingSessionResponse, status_code=status.HTTP_201_CREATED
)
def create_session(
    session_in: MappingSessionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> MappingSessionResponse:
    return ScanService.create_session(db, current_user.id, session_in)


@router.get("/{id}", response_model=MappingSessionResponse)
def get_session(
    id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> MappingSessionResponse:
    db_session = ScanService.get_session(db, id)
    if not db_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Mapping session not found"
        )
    return db_session


@router.post(
    "/{id}/assets",
    response_model=ScanAssetResponse,
    status_code=status.HTTP_201_CREATED,
)
def upload_asset(
    id: int,
    asset_in: ScanAssetCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> ScanAssetResponse:
    db_session = ScanService.get_session(db, id)
    if not db_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Mapping session not found"
        )
    return ScanService.add_asset(db, id, asset_in)


@router.post(
    "/{id}/upload-frame",
    response_model=ScanAssetResponse,
    status_code=status.HTTP_201_CREATED,
)
def upload_scan_frame(
    id: int,
    frame_in: ScanFrameUpload,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> ScanAssetResponse:
    db_session = ScanService.get_session(db, id)
    if not db_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Mapping session not found"
        )
    return ScanService.save_frame_image(
        db, id, frame_in.image_base64, frame_in.frame_index or 0
    )


@router.post("/{id}/process", response_model=MappingJobResponse)
def start_processing(
    id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> MappingJobResponse:
    db_job = ScanService.start_ai_job(db, id, current_user.id)
    if not db_job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mapping session not found to start processing",
        )
    return db_job


@router.get("/{id}/job-status", response_model=List[AIJobResultResponse])
def get_job_status(
    id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> List[AIJobResultResponse]:
    return ScanService.get_job_progress(db, id)


@router.get("/{id}/artifacts/point-cloud", response_model=PointCloudArtifact)
def get_point_cloud_artifact(
    id: int,
    current_user: User = Depends(get_current_active_user),
) -> PointCloudArtifact:
    return ScanService.get_point_cloud(id)


@router.get("/{id}/artifacts/detections", response_model=List[ObjectDetectionResponse])
def get_object_detections(
    id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> List[ObjectDetectionResponse]:
    return [
        ObjectDetectionResponse.model_validate(d)
        for d in ScanService.get_object_detections(db, id)
    ]


@router.get("/{id}/artifacts/ocr", response_model=List[OCRDetectionResponse])
def get_ocr_detections(
    id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> List[OCRDetectionResponse]:
    return [
        OCRDetectionResponse.model_validate(o)
        for o in ScanService.get_ocr_detections(db, id)
    ]


@router.put("/{id}/ocr/{ocr_id}", response_model=OCRDetectionResponse)
def update_ocr_detection(
    id: int,
    ocr_id: int,
    ocr_in: OCRDetectionUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> OCRDetectionResponse:
    res = ScanService.update_ocr_detection(db, id, ocr_id, ocr_in)
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="OCR detection not found"
        )
    return OCRDetectionResponse.model_validate(res)


@router.post("/{id}/ocr/accept-all", response_model=List[OCRDetectionResponse])
def accept_all_ocr_detections(
    id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> List[OCRDetectionResponse]:
    res = ScanService.accept_all_ocr(db, id)
    return [OCRDetectionResponse.model_validate(o) for o in res]


@router.get("/{id}/map-data", response_model=VectorMapData)
def get_vector_map_data(
    id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> VectorMapData:
    session = ScanService.get_session(db, id)
    floor_id = session.floor_id if session else 1
    return ScanService.get_map_data(id, floor_id)


@router.post("/{id}/map-data", response_model=VectorMapData)
def save_vector_map_data(
    id: int,
    map_in: VectorMapData,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> VectorMapData:
    return ScanService.save_map_data(id, map_in, db=db)

