from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
import jwt
from pydantic import ValidationError
from sqlmodel import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.core.security import create_access_token, create_refresh_token
from app.models.user_model import User
from app.schemas.auth import LoginRequest, RefreshTokenRequest, Token, TokenPayload
from app.schemas.user import UserCreate, UserResponse
from app.services.user_service import UserService

router = APIRouter()


# AUTH CONTROLLER 1: REGISTER USER
@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> User:
    existing_user = UserService.get_by_email(db, user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    return UserService.create_user(db, user_in)


# AUTH CONTROLLER 2: LOGIN USER
@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Token:
    user = UserService.authenticate(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )

    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        refresh_token=refresh_token,
    )


@router.post("/login/json", response_model=Token)
def login_json(user_in: LoginRequest, db: Session = Depends(get_db)) -> Token:
    user = UserService.authenticate(db, user_in.email, user_in.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )

    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        refresh_token=refresh_token,
    )


# AUTH CONTROLLER 3: REFRESH TOKEN
@router.post("/refresh", response_model=Token)
def refresh_token(payload: RefreshTokenRequest, db: Session = Depends(get_db)) -> Token:
    try:
        token_payload = jwt.decode(
            payload.refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**token_payload)
        if token_data.type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
            )
    except (jwt.PyJWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    user = UserService.get_by_id(db, token_data.sub)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )

    new_access_token = create_access_token(subject=user.id)
    new_refresh_token = create_refresh_token(subject=user.id)
    return Token(
        access_token=new_access_token,
        token_type="bearer",
        refresh_token=new_refresh_token,
    )


# AUTH CONTROLLER 4: LOGOUT
@router.post("/logout")
def logout() -> dict:
    return {"detail": "Successfully logged out"}


# AUTH CONTROLLER 5: GET CURRENT USER
@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_active_user)) -> User:
    return current_user
