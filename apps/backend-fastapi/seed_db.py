import os
from dotenv import load_dotenv
from sqlmodel import Session, create_engine, select

from app.models.hospital_model import Hospital, EmergencyContact
from app.models.building_model import Building
from app.models.floor_model import Floor

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL, echo=True)


def seed_data():
    print("Seeding database with Pakistani hospitals & facilities...")
    with Session(engine) as db:
        # Check if already seeded
        stmt = select(Hospital).where(Hospital.code == "PK-SKM-LHE-01")
        existing_hospital = db.exec(stmt).first()
        if existing_hospital:
            print("Database already has Pakistani hospital seed data. Skipping.")
            return

        # 1. Shaukat Khanum Memorial Cancer Hospital (Lahore)
        skm = Hospital(
            name="Shaukat Khanum Memorial Cancer Hospital",
            code="PK-SKM-LHE-01",
            description="Tertiary care cancer center & diagnostic navigation twin.",
            address="7A Block R-3, Johar Town, Lahore, Punjab, Pakistan",
            phone="+92 42 35905000",
            email="info@shaukatkhanum.org.pk",
            website="https://shaukatkhanum.org.pk",
            timezone="Asia/Karachi",
            latitude=31.4727,
            longitude=74.2728,
            status="active",
        )
        db.add(skm)
        db.flush()

        contacts = [
            EmergencyContact(
                hospital_id=skm.id,
                title="Hospital Reception",
                phone_number="+92 42 35905000",
            ),
            EmergencyContact(
                hospital_id=skm.id,
                title="Emergency Ambulance (Rescue 1122)",
                phone_number="1122",
            ),
            EmergencyContact(
                hospital_id=skm.id,
                title="Emergency Care Unit",
                phone_number="+92 42 35905001",
            ),
        ]
        for c in contacts:
            db.add(c)

        buildings = [
            Building(
                hospital_id=skm.id,
                name="Main Clinical Block",
                code="mb",
                status="active",
            ),
            Building(
                hospital_id=skm.id,
                name="Emergency & Trauma Block",
                code="eb",
                status="active",
            ),
            Building(
                hospital_id=skm.id,
                name="Diagnostics & Radiology Complex",
                code="rad",
                status="active",
            ),
            Building(
                hospital_id=skm.id,
                name="Outpatient Department (OPD)",
                code="opd",
                status="active",
            ),
        ]
        for b in buildings:
            db.add(b)
        db.flush()

        main_building = next(b for b in buildings if b.code == "mb")
        floors = [
            Floor(
                building_id=main_building.id,
                name="Ground Floor",
                floor_number=0,
                display_name="G",
                status="active",
            ),
            Floor(
                building_id=main_building.id,
                name="Floor 1 (Cardiology & ICU)",
                floor_number=1,
                display_name="1",
                status="active",
            ),
            Floor(
                building_id=main_building.id,
                name="Floor 2 (Oncology Wards)",
                floor_number=2,
                display_name="2",
                status="active",
            ),
            Floor(
                building_id=main_building.id,
                name="Basement 1 (Radiology & MRI)",
                floor_number=-1,
                display_name="B1",
                status="active",
            ),
        ]
        for f in floors:
            db.add(f)

        # 2. Aga Khan University Hospital (Karachi)
        aku = Hospital(
            name="Aga Khan University Hospital",
            code="PK-AKU-KHI-01",
            description="Premier tertiary academic medical center in Karachi.",
            address="Stadium Road, Karachi, Sindh, Pakistan",
            phone="+92 21 111 911 911",
            email="contact@aku.edu",
            website="https://hospitals.aku.edu/karachi",
            timezone="Asia/Karachi",
            latitude=24.8934,
            longitude=67.0743,
            status="active",
        )
        db.add(aku)
        db.flush()

        # 3. Pakistan Institute of Medical Sciences (Islamabad)
        pims = Hospital(
            name="Pakistan Institute of Medical Sciences (PIMS)",
            code="PK-PIMS-ISB-01",
            description="Leading public sector research & tertiary hospital in Islamabad.",
            address="Sector G-8/3, Islamabad, Federal Capital, Pakistan",
            phone="+92 51 9261170",
            email="info@pims.gov.pk",
            website="https://pims.gov.pk",
            timezone="Asia/Karachi",
            latitude=33.7028,
            longitude=73.0531,
            status="active",
        )
        db.add(pims)

        db.commit()
        print("✅ Database successfully seeded with Pakistani hospital records!")


if __name__ == "__main__":
    seed_data()
