from typing import Optional
from sqlmodel import Session, select

from app.core.security import get_password_hash, verify_password
from app.models.user_model import User, UserPreference
from app.schemas.user import UserCreate, UserPreferenceUpdate


class UserService:
    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email)
        return db.exec(stmt).first()

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        return db.get(User, user_id)

    @staticmethod
    def create_user(db: Session, user_in: UserCreate) -> User:
        hashed_pw = get_password_hash(user_in.password)
        db_user = User(
            email=user_in.email,
            hashed_password=hashed_pw,
            full_name=user_in.full_name,
            phone=user_in.phone,
            is_active=True,
            is_superuser=False,
        )
        db.add(db_user)
        db.flush()

        db_pref = UserPreference(
            user_id=db_user.id,
            preferred_language="en",
            voice_guidance_enabled=True,
            voice_language="en-US",
            text_size="normal",
            high_contrast_enabled=False,
            route_mode="normal",
        )
        db.add(db_pref)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def authenticate(db: Session, email: str, password: str) -> Optional[User]:
        user = UserService.get_by_email(db, email)
        if not user or not verify_password(password, user.hashed_password):
            return None
        return user

    @staticmethod
    def get_preferences(db: Session, user_id: int) -> Optional[UserPreference]:
        stmt = select(UserPreference).where(UserPreference.user_id == user_id)
        return db.exec(stmt).first()

    @staticmethod
    def update_preferences(db: Session, user_id: int, pref_in: UserPreferenceUpdate) -> Optional[UserPreference]:
        db_pref = UserService.get_preferences(db, user_id)
        if not db_pref:
            db_pref = UserPreference(user_id=user_id)
            db.add(db_pref)
            db.flush()

        pref_data = pref_in.model_dump(exclude_unset=True)
        for key, value in pref_data.items():
            setattr(db_pref, key, value)

        db.add(db_pref)
        db.commit()
        db.refresh(db_pref)
        return db_pref

