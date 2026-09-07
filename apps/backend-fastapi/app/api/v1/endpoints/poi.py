from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.user_model import User
from app.models.poi_model import PointOfInterest, POICategory
from app.schemas.poi import (
    POICategoryCreate,
    POICategoryResponse,
    POICreate,
    POIUpdate,
    POIResponse,
)

router = APIRouter()


@router.get("/categories", response_model=List[POICategoryResponse])
def list_poi_categories(db: Session = Depends(get_db)) -> List[POICategoryResponse]:
    return list(db.exec(select(POICategory)).all())


@router.post("/categories", response_model=POICategoryResponse, status_code=status.HTTP_201_CREATED)
def create_poi_category(
    cat_in: POICategoryCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> POICategoryResponse:
    existing = db.exec(select(POICategory).where(POICategory.code == cat_in.code)).first()
    if existing:
        return existing
    cat = POICategory(**cat_in.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.get("/floors/{floor_id}", response_model=List[POIResponse])
def list_pois_by_floor(
    floor_id: int,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
) -> List[POIResponse]:
    query = select(PointOfInterest).where(PointOfInterest.floor_id == floor_id)
    if category_id:
        query = query.where(PointOfInterest.category_id == category_id)
    return list(db.exec(query).all())


@router.get("/hospitals/{hospital_id}", response_model=List[POIResponse])
def list_pois_by_hospital(
    hospital_id: int,
    db: Session = Depends(get_db),
) -> List[POIResponse]:
    query = select(PointOfInterest).where(PointOfInterest.hospital_id == hospital_id)
    return list(db.exec(query).all())


@router.post("/", response_model=POIResponse, status_code=status.HTTP_201_CREATED)
def create_poi(
    poi_in: POICreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> POIResponse:
    poi = PointOfInterest(**poi_in.model_dump())
    db.add(poi)
    db.commit()
    db.refresh(poi)
    return poi


@router.get("/{id}", response_model=POIResponse)
def get_poi(id: int, db: Session = Depends(get_db)) -> POIResponse:
    poi = db.get(PointOfInterest, id)
    if not poi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="POI not found")
    return poi


@router.put("/{id}", response_model=POIResponse)
def update_poi(
    id: int,
    poi_in: POIUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> POIResponse:
    poi = db.get(PointOfInterest, id)
    if not poi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="POI not found")
    update_data = poi_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(poi, key, value)
    db.add(poi)
    db.commit()
    db.refresh(poi)
    return poi


@router.delete("/{id}", response_model=POIResponse)
def delete_poi(
    id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> POIResponse:
    poi = db.get(PointOfInterest, id)
    if not poi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="POI not found")
    db.delete(poi)
    db.commit()
    return poi
