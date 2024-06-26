#!/usr/bin/env python3
# File: base_schema.py
"""Base Schema"""


from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class ModelBaseInfo(BaseModel):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
