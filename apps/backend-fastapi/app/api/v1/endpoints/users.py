from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel, EmailStr

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.core.security import get_password_hash
from app.models.user_model import User, Role, UserRole
from app.schemas.user import UserPreferenceResponse, UserPreferenceUpdate, UserResponse
from app.services.user_service import UserService

router = APIRouter()


class AdminUserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    role_name: Optional[str] = "Mapper"
    is_active: bool = True
    is_superuser: bool = False


class AdminUserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role_name: Optional[str] = None
    is_active: Optional[bool] = None


class UserDetailResponse(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    is_active: bool
    is_superuser: bool
    roles: List[str] = []


@router.get("/", response_model=List[UserDetailResponse])
def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
) -> List[UserDetailResponse]:
    users = db.exec(select(User).offset(skip).limit(limit)).all()
    results = []
    for u in users:
        user_roles = db.exec(select(UserRole).where(UserRole.user_id == u.id)).all()
        role_names = []
        for ur in user_roles:
            r = db.get(Role, ur.role_id)
            if r:
                role_names.append(r.name)
        if not role_names and u.is_superuser:
            role_names = ["Super Admin"]
        elif not role_names:
            role_names = ["Mapper"]

        results.append(
            UserDetailResponse(
                id=u.id,
                email=u.email,
                full_name=u.full_name,
                phone=u.phone,
                is_active=u.is_active,
                is_superuser=u.is_superuser,
                roles=role_names,
            )
        )
    return results


@router.post("/", response_model=UserDetailResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: AdminUserCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> UserDetailResponse:
    existing = UserService.get_by_email(db, user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        phone=user_in.phone,
        is_active=user_in.is_active,
        is_superuser=user_in.is_superuser or (user_in.role_name == "Super Admin"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    if user_in.role_name:
        role = db.exec(select(Role).where(Role.name == user_in.role_name)).first()
        if not role:
            role = Role(name=user_in.role_name, description=f"{user_in.role_name} role")
            db.add(role)
            db.commit()
            db.refresh(role)
        db.add(UserRole(user_id=user.id, role_id=role.id))
        db.commit()

    return UserDetailResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        is_active=user.is_active,
        is_superuser=user.is_superuser,
        roles=[user_in.role_name or "Mapper"],
    )


@router.put("/{id}", response_model=UserDetailResponse)
def update_user(
    id: int,
    user_in: AdminUserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> UserDetailResponse:
    user = db.get(User, id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user_in.email is not None:
        user.email = user_in.email
    if user_in.full_name is not None:
        user.full_name = user_in.full_name
    if user_in.phone is not None:
        user.phone = user_in.phone
    if user_in.is_active is not None:
        user.is_active = user_in.is_active
    if user_in.password:
        user.hashed_password = get_password_hash(user_in.password)

    db.add(user)
    db.commit()
    db.refresh(user)

    if user_in.role_name:
        existing_roles = db.exec(select(UserRole).where(UserRole.user_id == user.id)).all()
        for er in existing_roles:
            db.delete(er)
        role = db.exec(select(Role).where(Role.name == user_in.role_name)).first()
        if not role:
            role = Role(name=user_in.role_name)
            db.add(role)
            db.commit()
            db.refresh(role)
        db.add(UserRole(user_id=user.id, role_id=role.id))
        db.commit()

    return UserDetailResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        is_active=user.is_active,
        is_superuser=user.is_superuser,
        roles=[user_in.role_name] if user_in.role_name else ["Mapper"],
    )


@router.delete("/{id}", response_model=Dict[str, bool])
def delete_user(
    id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Dict[str, bool]:
    user = db.get(User, id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user_roles = db.exec(select(UserRole).where(UserRole.user_id == id)).all()
    for ur in user_roles:
        db.delete(ur)
    db.delete(user)
    db.commit()
    return {"ok": True}


@router.get("/me/preferences", response_model=UserPreferenceResponse)
def get_my_preferences(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> UserPreferenceResponse:
    db_pref = UserService.get_preferences(db, current_user.id)
    if not db_pref:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User preferences not found",
        )
    return db_pref


@router.put("/me/preferences", response_model=UserPreferenceResponse)
def update_my_preferences(
    pref_in: UserPreferenceUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> UserPreferenceResponse:
    db_pref = UserService.update_preferences(db, current_user.id, pref_in)
    if not db_pref:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not update user preferences",
        )
    return db_pref
