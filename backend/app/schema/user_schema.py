#!/usr/bin/env python3
# File: user_schema.py
"""User Schema"""


from typing import Optional
from pydantic import BaseModel
from app.schema.base_schema import ModelBaseInfo
from app.util.schema import AllOptional


class BaseUser(BaseModel):
    email: str

    first_name: Optional[str]
    last_name: Optional[str]

    phone_no: Optional[str]

    class Config:
        from_attributes = True


class BaseUserWithPassword(BaseUser):
    password: str


class User(ModelBaseInfo, BaseUser, AllOptional):
    phone_no: Optional[str]
    is_2fa_enabled: Optional[bool]
    is_2fa_setup: Optional[bool]
    is_otp_verified: Optional[bool]
    auth_2fa_type: Optional[str]
    otp_secret: Optional[str]
    otp_auth_url: Optional[str]
    ...


class UserOTPPayload(BaseModel):
    # email: str
    otp: str


class User2FaUpdate(BaseModel):
    authentication_type: str

class UserOTPResponse(BaseModel):
    otp_verified: bool

class FindUser(BaseModel):
    email: str
    ...


class FindUserByEmail(BaseModel):
    email: str


class Enable2faUser(BaseModel):
    enable_2fa: bool
    auth_2fa_type: Optional[str] = None
