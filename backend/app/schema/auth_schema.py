#!/usr/bin/env python3
# File: user_schema.py
"""User Schema"""


from datetime import datetime
import re
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, field_validator
from app.schema.user_schema import User
from app.util.util import check_password_strength


class SignUpValueError(ValueError):
    def __init__(self, message: str) -> None:
        self.message = message
        # super().__init__(message)

    def __str__(self) -> str:
        return f"""{self.message}"""


class SignIn(BaseModel):
    email: str
    password: str


class SignUp(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str
    phone_no: str
    enable_2fa: Optional[bool]
    authentication_type: Optional[str] = Field(default=None)

    # validator for email field
    @field_validator("email")
    def check_email(cls, value):
        # use a regex to check that the email has a valid format
        email_regex = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
        if not re.match(email_regex, value):
            raise SignUpValueError('Invalid email address')
        return value

    @field_validator('first_name')
    def check_firstname(cls, value):
        if len(value) <= 0 or not value:
            raise ValueError("First name cannot be blank!")

        return value

    @field_validator('last_name')
    def check_lastname(cls, value):
        if len(value) <= 0 or not value:
            raise ValueError('Last name cannot be blank!')
        return value

    # field validator for password
    @field_validator('password')
    def validate_password(cls, value):
        if len(value) < 7:
            raise SignUpValueError("Password is too short!")

        if len(value) > 10:
            raise SignUpValueError("Password must be 7 to 10 characters long")

        if not check_password_strength(value):
            raise ValueError("Password is too weak!")
        
        return value


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
