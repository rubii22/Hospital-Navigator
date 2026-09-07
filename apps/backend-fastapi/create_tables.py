import os
import sys

# Auto‑activate the local .venv if this script is run with the system python
venv_python = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".venv", "bin", "python")
if os.path.exists(venv_python) and sys.executable != venv_python and "VIRTUAL_ENV" not in os.environ:
    os.execv(venv_python, [venv_python] + sys.argv)

import os
from dotenv import load_dotenv
from sqlmodel import SQLModel, create_engine, text

# Import all models to register them in SQLModel.metadata
import app.models as models

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
)

engine = create_engine(DATABASE_URL, echo=True)


def main():
    print("Connecting to PostgreSQL database...")
    with engine.connect() as conn:
        try:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
            conn.commit()
            print("PostGIS extension enabled / verified.")
        except Exception as e:
            print(f"Notice: Could not enable postgis extension ({e}). Proceeding...")
            conn.rollback()

    print("Pushing all SQLModel tables to Docker database...")
    SQLModel.metadata.create_all(engine)

    print("Applying schema updates / migrations...")
    with engine.connect() as conn:
        try:
            conn.execute(
                text(
                    "ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL;"
                )
            )
            conn.commit()
            print("Successfully verified/added owner_id to hospitals table.")
        except Exception as e:
            print(f"Notice: Migration failed or was already applied ({e}). Proceeding...")
            conn.rollback()


    print("\nVerifying created tables in 'hospital_navigator' DB:")
    with engine.connect() as conn:
        result = conn.execute(
            text(
                """
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """
            )
        )
        tables = [row[0] for row in result]
        print(f"Successfully created {len(tables)} tables in PostgreSQL:")
        for t in tables:
            print(f"  - {t}")


if __name__ == "__main__":
    main()
