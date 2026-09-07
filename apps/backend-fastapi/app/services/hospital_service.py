from typing import Optional, List
from sqlmodel import Session, select

from app.models.hospital_model import Hospital, EmergencyContact
from app.models.building_model import Building
from app.models.floor_model import Floor
from app.models.room_model import Room
from app.models.department_model import Department

from app.schemas.hospital import (
    HospitalCreate,
    HospitalUpdate,
    BuildingCreate,
    BuildingUpdate,
    FloorCreate,
    FloorUpdate,
    RoomCreate,
    RoomUpdate,
    DepartmentCreate,
    DepartmentUpdate,
    EmergencyContactCreate,
)


class HospitalService:
    # --- Hospital CRUD ---
    @staticmethod
    def get_hospital(db: Session, hospital_id: int) -> Optional[Hospital]:
        return db.get(Hospital, hospital_id)

    @staticmethod
    def get_hospital_by_code(db: Session, code: str) -> Optional[Hospital]:
        stmt = select(Hospital).where(Hospital.code == code)
        return db.exec(stmt).first()

    @staticmethod
    def get_all_hospitals(
        db: Session, skip: int = 0, limit: int = 100
    ) -> List[Hospital]:
        stmt = select(Hospital).offset(skip).limit(limit)
        return list(db.exec(stmt).all())

    @staticmethod
    def create_hospital(db: Session, hospital_in: HospitalCreate, owner_id: Optional[int] = None) -> Hospital:
        db_hospital = Hospital.model_validate(hospital_in)
        if owner_id is not None:
            db_hospital.owner_id = owner_id
        db.add(db_hospital)
        db.commit()
        db.refresh(db_hospital)
        return db_hospital

    @staticmethod
    def get_hospitals_by_owner(
        db: Session, owner_id: int, skip: int = 0, limit: int = 100
    ) -> List[Hospital]:
        stmt = select(Hospital).where(Hospital.owner_id == owner_id).offset(skip).limit(limit)
        return list(db.exec(stmt).all())


    @staticmethod
    def update_hospital(
        db: Session, db_hospital: Hospital, hospital_in: HospitalUpdate
    ) -> Hospital:
        obj_data = hospital_in.model_dump(exclude_unset=True)
        for key, value in obj_data.items():
            setattr(db_hospital, key, value)
        db.add(db_hospital)
        db.commit()
        db.refresh(db_hospital)
        return db_hospital

    @staticmethod
    def delete_hospital(db: Session, hospital_id: int) -> Optional[Hospital]:
        db_hospital = db.get(Hospital, hospital_id)
        if db_hospital:
            db.delete(db_hospital)
            db.commit()
        return db_hospital

    # --- Building CRUD ---
    @staticmethod
    def get_building(db: Session, building_id: int) -> Optional[Building]:
        return db.get(Building, building_id)

    @staticmethod
    def get_buildings_by_hospital(db: Session, hospital_id: int) -> List[Building]:
        stmt = select(Building).where(Building.hospital_id == hospital_id)
        return list(db.exec(stmt).all())

    @staticmethod
    def create_building(
        db: Session, hospital_id: int, building_in: BuildingCreate
    ) -> Building:
        db_building = Building(hospital_id=hospital_id, **building_in.model_dump())
        db.add(db_building)
        db.commit()
        db.refresh(db_building)
        return db_building

    @staticmethod
    def update_building(
        db: Session, db_building: Building, building_in: BuildingUpdate
    ) -> Building:
        obj_data = building_in.model_dump(exclude_unset=True)
        for key, value in obj_data.items():
            setattr(db_building, key, value)
        db.add(db_building)
        db.commit()
        db.refresh(db_building)
        return db_building

    @staticmethod
    def delete_building(db: Session, building_id: int) -> Optional[Building]:
        db_building = db.get(Building, building_id)
        if db_building:
            db.delete(db_building)
            db.commit()
        return db_building

    # --- Floor CRUD ---
    @staticmethod
    def get_floor(db: Session, floor_id: int) -> Optional[Floor]:
        return db.get(Floor, floor_id)

    @staticmethod
    def get_floors_by_building(db: Session, building_id: int) -> List[Floor]:
        stmt = select(Floor).where(Floor.building_id == building_id)
        return list(db.exec(stmt).all())

    @staticmethod
    def create_floor(db: Session, building_id: int, floor_in: FloorCreate) -> Floor:
        db_floor = Floor(building_id=building_id, **floor_in.model_dump())
        db.add(db_floor)
        db.commit()
        db.refresh(db_floor)
        return db_floor

    @staticmethod
    def update_floor(db: Session, db_floor: Floor, floor_in: FloorUpdate) -> Floor:
        obj_data = floor_in.model_dump(exclude_unset=True)
        for key, value in obj_data.items():
            setattr(db_floor, key, value)
        db.add(db_floor)
        db.commit()
        db.refresh(db_floor)
        return db_floor

    @staticmethod
    def delete_floor(db: Session, floor_id: int) -> Optional[Floor]:
        db_floor = db.get(Floor, floor_id)
        if db_floor:
            db.delete(db_floor)
            db.commit()
        return db_floor

    # --- Room CRUD ---
    @staticmethod
    def get_room(db: Session, room_id: int) -> Optional[Room]:
        return db.get(Room, room_id)

    @staticmethod
    def get_rooms_by_floor(db: Session, floor_id: int) -> List[Room]:
        stmt = select(Room).where(Room.floor_id == floor_id)
        return list(db.exec(stmt).all())

    @staticmethod
    def create_room(db: Session, floor_id: int, room_in: RoomCreate) -> Room:
        db_room = Room(floor_id=floor_id, **room_in.model_dump())
        db.add(db_room)
        db.commit()
        db.refresh(db_room)
        return db_room

    @staticmethod
    def update_room(db: Session, db_room: Room, room_in: RoomUpdate) -> Room:
        obj_data = room_in.model_dump(exclude_unset=True)
        for key, value in obj_data.items():
            setattr(db_room, key, value)
        db.add(db_room)
        db.commit()
        db.refresh(db_room)
        return db_room

    @staticmethod
    def delete_room(db: Session, room_id: int) -> Optional[Room]:
        db_room = db.get(Room, room_id)
        if db_room:
            db.delete(db_room)
            db.commit()
        return db_room

    # --- Department CRUD ---
    @staticmethod
    def get_department(db: Session, department_id: int) -> Optional[Department]:
        return db.get(Department, department_id)

    @staticmethod
    def get_departments_by_hospital(db: Session, hospital_id: int) -> List[Department]:
        stmt = select(Department).where(Department.hospital_id == hospital_id)
        return list(db.exec(stmt).all())

    @staticmethod
    def create_department(
        db: Session, hospital_id: int, department_in: DepartmentCreate
    ) -> Department:
        db_department = Department(
            hospital_id=hospital_id, **department_in.model_dump()
        )
        db.add(db_department)
        db.commit()
        db.refresh(db_department)
        return db_department

    @staticmethod
    def update_department(
        db: Session, db_department: Department, department_in: DepartmentUpdate
    ) -> Department:
        obj_data = department_in.model_dump(exclude_unset=True)
        for key, value in obj_data.items():
            setattr(db_department, key, value)
        db.add(db_department)
        db.commit()
        db.refresh(db_department)
        return db_department

    @staticmethod
    def delete_department(db: Session, department_id: int) -> Optional[Department]:
        db_department = db.get(Department, department_id)
        if db_department:
            db.delete(db_department)
            db.commit()
        return db_department

    # --- Emergency Contact CRUD ---
    @staticmethod
    def get_emergency_contacts_by_hospital(db: Session, hospital_id: int) -> List[EmergencyContact]:
        stmt = select(EmergencyContact).where(EmergencyContact.hospital_id == hospital_id)
        return list(db.exec(stmt).all())

    @staticmethod
    def create_emergency_contact(db: Session, hospital_id: int, contact_in: EmergencyContactCreate) -> EmergencyContact:
        db_contact = EmergencyContact(hospital_id=hospital_id, **contact_in.model_dump())
        db.add(db_contact)
        db.commit()
        db.refresh(db_contact)
        return db_contact

