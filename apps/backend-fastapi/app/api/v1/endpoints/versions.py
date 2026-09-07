from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.user_model import User
from app.models.map_version_model import MapVersion, NavPack
from app.schemas.version import (
    MapVersionCreate,
    MapVersionUpdate,
    MapVersionResponse,
    NavPackCreate,
    NavPackResponse,
)

router = APIRouter()


@router.get("/", response_model=List[MapVersionResponse])
def list_map_versions(
    building_id: Optional[int] = None,
    db: Session = Depends(get_db),
) -> List[MapVersionResponse]:
    query = select(MapVersion)
    if building_id:
        query = query.where(MapVersion.building_id == building_id)
    return list(db.exec(query.order_by(MapVersion.created_at.desc())).all())


@router.post("/", response_model=MapVersionResponse, status_code=status.HTTP_201_CREATED)
def create_map_version(
    ver_in: MapVersionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> MapVersionResponse:
    version = MapVersion(**ver_in.model_dump())
    db.add(version)
    db.commit()
    db.refresh(version)
    return version


@router.get("/{id}", response_model=MapVersionResponse)
def get_map_version(id: int, db: Session = Depends(get_db)) -> MapVersionResponse:
    version = db.get(MapVersion, id)
    if not version:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Map version not found")
    return version


@router.put("/{id}", response_model=MapVersionResponse)
def update_map_version(
    id: int,
    ver_in: MapVersionUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> MapVersionResponse:
    version = db.get(MapVersion, id)
    if not version:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Map version not found")
    update_data = ver_in.model_dump(exclude_unset=True)
    for key, val in update_data.items():
        setattr(version, key, val)
    db.add(version)
    db.commit()
    db.refresh(version)
    return version


@router.post("/{id}/publish", response_model=MapVersionResponse)
def publish_map_version(
    id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> MapVersionResponse:
    version = db.get(MapVersion, id)
    if not version:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Map version not found")
    version.status = "published"
    version.published_at = datetime.now(timezone.utc)
    version.reviewer_id = current_user.id
    db.add(version)
    db.commit()
    db.refresh(version)
    return version


@router.get("/navpacks/all", response_model=List[NavPackResponse])
def list_navpacks(
    map_version_id: Optional[int] = None,
    db: Session = Depends(get_db),
) -> List[NavPackResponse]:
    query = select(NavPack)
    if map_version_id:
        query = query.where(NavPack.map_version_id == map_version_id)
    return list(db.exec(query.order_by(NavPack.created_at.desc())).all())


@router.post("/navpacks/generate", response_model=NavPackResponse, status_code=status.HTTP_201_CREATED)
def generate_navpack(
    pack_in: NavPackCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> NavPackResponse:
    pack = NavPack(
        **pack_in.model_dump(),
        generated_at=datetime.now(timezone.utc),
    )
    db.add(pack)
    db.commit()
    db.refresh(pack)
    return pack
