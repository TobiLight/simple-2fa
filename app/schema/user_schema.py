#!/usr/bin/env python3
# File: user_schema.py
"""User Schema"""


from typing import Optional, Union

from pydantic import BaseModel, Field

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
    auth_2fa_type: Optional[str]
    ...


class FindUser(BaseModel):
    email: str
    ...


class FindUserByEmail(BaseModel):
    email: str


class Enable2faUser(BaseModel):
    enable_2fa: bool
    auth_2fa_type: Optional[str] = None
