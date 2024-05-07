#!/usr/bin/env python3
# File: schema.py
"""All Optional Schema"""


from typing import Optional
from pydantic import BaseModel


class AllOptional(BaseModel):
    @classmethod
    def __get_annotations__(cls):
        annotations = AllOptional.__get_annotations__()

        for field, type_ in annotations.items():
            if not field.startswith("__"):
                annotations[field] = Optional[type_]
        return annotations

    # class Config:
    #     arbitrary_types_allowed = True
