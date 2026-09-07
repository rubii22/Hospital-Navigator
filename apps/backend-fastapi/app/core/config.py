from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Hospital Navigator API"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    TESTING: bool = False

    # Database
    DATABASE_URL: str
    ASYNC_DATABASE_URL: str

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS
    BACKEND_CORS_ORIGINS: Union[List[str], str] = []

    # Redis / Celery — read by celery_app.py; API does not start workers.
    REDIS_URL: str = "redis://localhost:6379/0"

    # Storage backend — "local" uses the filesystem under STORAGE_LOCAL_PATH.
    # Future: "s3" for S3-compatible object storage.
    STORAGE_BACKEND: str = "local"
    STORAGE_LOCAL_PATH: str = "storage"

    # Navpack signing — path to an Ed25519 private key (PEM).  If blank,
    # navpack compilation skips signing.
    NAVPACK_SIGNING_KEY_PATH: str = ""

    @field_validator("DEBUG", mode="before")
    @classmethod
    def coerce_debug(cls, v):
        """Coerce non-boolean DEBUG values (e.g. shell ``DEBUG=release``)
        to a proper boolean so that Pydantic does not reject them during
        test collection or in deployment environments.
        """
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            return v.strip().lower() in ("1", "true", "yes", "on")
        return bool(v)

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=True, extra="ignore"
    )


settings = Settings()
