#!/usr/bin/env python3
# File: user.py
"""User endpoint"""


from fastapi import APIRouter, Depends
from dependency_injector.wiring import inject, Provide

from app.core.container import Container
from app.schema.user_schema import FindUserByEmail
from app.services.user_service import UserService


router = APIRouter(
	prefix="/user",
	tags=["User"]
)


@router.get("/", summary="Get a user's info")
@inject
def get_user(
    user_info: FindUserByEmail,
    service: UserService = Depends(Provide[Container.user_service])
):
    """"""
    # user = service.user_repository.get()

    # return user
    return {}
