#!/usr/bin/env python3
# File: base_model.py
"""Base Model"""


from datetime import datetime
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field


class BaseModel(SQLModel):
    __abstract__ = True

    id: UUID = Field(primary_key=True, default=uuid4())

    created_at: datetime = Field(default=datetime.now())

    updated_at: datetime = Field(default=datetime.now())
