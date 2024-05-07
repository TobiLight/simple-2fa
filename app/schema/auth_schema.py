#!/usr/bin/env python3
# File: user_schema.py
"""User Schema"""


from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field
from app.schema.user_schema import User


class SignIn(BaseModel):
    email: str
    password: str


class SignUp(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone_no: str
    enable_2fa: Optional[bool]
    authentication_type: Optional[str] = Field(default=None)


class Payload(BaseModel):
    id: str
    email: str
    name: str


class SignInResponse(BaseModel):
    access_token: str
    expiration: datetime
    user_info: User


class SignUpResponse(BaseModel):
    user: User


class User2fa(BaseModel):
    email: str


class OTPPayload(BaseModel):
    email: str
    password: str
    otp: str
