#!/usr/bin/env python3
# File: user.py
"""User Model"""


from typing import List, Optional
from pydantic import EmailStr
from sqlalchemy import Boolean, Column, String, text, Enum
from app.core.database import Base
from app.model.base_model import BaseModel
from sqlalchemy.orm import Session
from sqlmodel import Field, Relationship
import enum


class AuthType(str, enum.Enum):
    """User SignUp Type"""
    Authenticator = "Google-Authenticator"
    Sms = "SMS"


AuthTypeEnum: Enum = Enum(
    AuthType,
    name="signup_type_enum",
    create_constraint=True,
    metadata=Base.metadata,
    validate_strings=True,
)


class User(BaseModel, table=True):
    __tablename__: str = 'users'

    first_name: str = Field(sa_column=Column(
        String(50), default=None, nullable=True))

    last_name: str = Field(sa_column=Column(
        String(50), default=None, nullable=True))

    email: EmailStr = Field(sa_column=Column(String(255), unique=True))

    password: str = Field(sa_column=Column(
        String(255), default=None, nullable=True))

    phone_no: str = Field(sa_column=Column(
        String(24), default=None, nullable=True))

    is_active: bool = Field(sa_column=Column(Boolean, default=True))

    is_2fa_enabled: bool = Field(sa_column=Column(Boolean, default=False))

    is_2fa_setup: bool = Field(sa_column=Column(Boolean, default=False))

    is_otp_verified: bool = Field(sa_column=Column(Boolean, default=False))

    auth_2fa_type: Optional[AuthType] = Field(
        default=None, nullable=True)

    otp_secret: Optional[str] = Field(sa_column=Column(String, nullable=True))

    otp_auth_url: Optional[str] = Field(
        sa_column=Column(String, nullable=True))
