from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.user_model import User
from app.services.hospital_service import HospitalService
from app.schemas.hospital import (
    HospitalCreate,
    HospitalUpdate,
    HospitalResponse,
    BuildingCreate,
    BuildingUpdate,
    BuildingResponse,
    FloorCreate,
    FloorUpdate,
    FloorResponse,
    RoomCreate,
    RoomUpdate,
    RoomResponse,
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentResponse,
    EmergencyContactCreate,
    EmergencyContactResponse,
)

router = APIRouter()


# --- Hospital Endpoints ---
@router.get("/", response_model=List[HospitalResponse])
def list_hospitals(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
) -> List[HospitalResponse]:
    return HospitalService.get_all_hospitals(db, skip=skip, limit=limit)


@router.get("/my", response_model=List[HospitalResponse])
def list_my_hospitals(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> List[HospitalResponse]:
    return HospitalService.get_hospitals_by_owner(
        db, owner_id=current_user.id, skip=skip, limit=limit
    )


@router.get("/{id}", response_model=HospitalResponse)
def get_hospital(id: int, db: Session = Depends(get_db)) -> HospitalResponse:
    db_hospital = HospitalService.get_hospital(db, id)
    if not db_hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found"
        )
    return db_hospital


@router.post("/", response_model=HospitalResponse, status_code=status.HTTP_201_CREATED)
def create_hospital(
    hospital_in: HospitalCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> HospitalResponse:
    existing_hospital = HospitalService.get_hospital_by_code(db, hospital_in.code)
    if existing_hospital:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Hospital with code {hospital_in.code} already exists",
        )
    return HospitalService.create_hospital(db, hospital_in, owner_id=current_user.id)


@router.put("/{id}", response_model=HospitalResponse)
def update_hospital(
    id: int,
    hospital_in: HospitalUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> HospitalResponse:
    db_hospital = HospitalService.get_hospital(db, id)
    if not db_hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found"
        )
    if db_hospital.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to edit this hospital",
        )
    return HospitalService.update_hospital(db, db_hospital, hospital_in)


@router.delete("/{id}", response_model=HospitalResponse)
def delete_hospital(
    id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> HospitalResponse:
    db_hospital = HospitalService.get_hospital(db, id)
    if not db_hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found"
        )
    if db_hospital.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this hospital",
        )
    return HospitalService.delete_hospital(db, id)


# --- Building Endpoints ---
@router.get("/{id}/buildings", response_model=List[BuildingResponse])
def list_buildings(id: int, db: Session = Depends(get_db)) -> List[BuildingResponse]:
    db_hospital = HospitalService.get_hospital(db, id)
    if not db_hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found"
        )
    return HospitalService.get_buildings_by_hospital(db, id)


@router.post(
    "/{id}/buildings",
    response_model=BuildingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_building(
    id: int,
    building_in: BuildingCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> BuildingResponse:
    db_hospital = HospitalService.get_hospital(db, id)
    if not db_hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found"
        )
    return HospitalService.create_building(db, id, building_in)


# --- Floor Endpoints ---
@router.get("/buildings/{building_id}/floors", response_model=List[FloorResponse])
def list_floors(building_id: int, db: Session = Depends(get_db)) -> List[FloorResponse]:
    db_building = HospitalService.get_building(db, building_id)
    if not db_building:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Building not found"
        )
    return HospitalService.get_floors_by_building(db, building_id)


@router.post(
    "/buildings/{building_id}/floors",
    response_model=FloorResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_floor(
    building_id: int,
    floor_in: FloorCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> FloorResponse:
    db_building = HospitalService.get_building(db, building_id)
    if not db_building:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Building not found"
        )
    return HospitalService.create_floor(db, building_id, floor_in)


# --- Room Endpoints ---
@router.get("/floors/{floor_id}/rooms", response_model=List[RoomResponse])
def list_rooms(floor_id: int, db: Session = Depends(get_db)) -> List[RoomResponse]:
    db_floor = HospitalService.get_floor(db, floor_id)
    if not db_floor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Floor not found"
        )
    return HospitalService.get_rooms_by_floor(db, floor_id)


@router.post(
    "/floors/{floor_id}/rooms",
    response_model=RoomResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_room(
    floor_id: int,
    room_in: RoomCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> RoomResponse:
    db_floor = HospitalService.get_floor(db, floor_id)
    if not db_floor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Floor not found"
        )
    return HospitalService.create_room(db, floor_id, room_in)


# --- Department Endpoints ---
@router.get("/{id}/departments", response_model=List[DepartmentResponse])
def list_departments(
    id: int, db: Session = Depends(get_db)
) -> List[DepartmentResponse]:
    db_hospital = HospitalService.get_hospital(db, id)
    if not db_hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found"
        )
    return HospitalService.get_departments_by_hospital(db, id)


@router.post(
    "/{id}/departments",
    response_model=DepartmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_department(
    id: int,
    department_in: DepartmentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> DepartmentResponse:
    db_hospital = HospitalService.get_hospital(db, id)
    if not db_hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found"
        )
    return HospitalService.create_department(db, id, department_in)


# --- Emergency Contact Endpoints ---
@router.get("/{id}/emergency-contacts", response_model=List[EmergencyContactResponse])
def list_emergency_contacts(
    id: int, db: Session = Depends(get_db)
) -> List[EmergencyContactResponse]:
    db_hospital = HospitalService.get_hospital(db, id)
    if not db_hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found"
        )
    return HospitalService.get_emergency_contacts_by_hospital(db, id)


@router.post(
    "/{id}/emergency-contacts",
    response_model=EmergencyContactResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_emergency_contact(
    id: int,
    contact_in: EmergencyContactCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> EmergencyContactResponse:
    db_hospital = HospitalService.get_hospital(db, id)
    if not db_hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found"
        )
    return HospitalService.create_emergency_contact(db, id, contact_in)
