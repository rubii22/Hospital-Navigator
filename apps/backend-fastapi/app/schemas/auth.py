from typing import Optional
from pydantic import EmailStr
from sqlmodel import SQLModel


class LoginRequest(SQLModel):
    email: EmailStr
    password: str


class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: Optional[str] = None


class TokenPayload(SQLModel):
    sub: Optional[int] = None
    exp: Optional[int] = None
    type: Optional[str] = None


class RefreshTokenRequest(SQLModel):
    refresh_token: str
