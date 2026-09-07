import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import ValidationError
from sqlmodel import Session, select

from app.core.config import settings
from app.core.database import get_db
from app.models.user_model import User, UserRole, Role
from app.services.user_service import UserService
from app.schemas.auth import TokenPayload

reusable_oauth2 = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
        if token_data.type != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
            )
    except (jwt.PyJWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    user = UserService.get_by_id(db, token_data.sub)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    return current_user


def get_current_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges",
        )
    return current_user


# ── Role-based access helpers ──────────────────────────────────────────

def _require_role(role_name: str):
    """Return a dependency that verifies the current user has ``role_name``."""

    def _dep(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_active_user),
    ) -> User:
        stmt = (
            select(UserRole)
            .where(UserRole.user_id == current_user.id)
            .join(Role)
            .where(Role.name == role_name)
        )
        if not db.exec(stmt).first():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{role_name}' is required",
            )
        return current_user

    return _dep


get_mapper_user = Depends(_require_role("mapper"))
get_reviewer_user = Depends(_require_role("reviewer"))
get_publisher_user = Depends(_require_role("publisher"))
