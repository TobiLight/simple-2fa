#!/usr/bin/env python3
# File: user.py
"""User endpoint"""


from fastapi import APIRouter, Depends
from dependency_injector.wiring import inject, Provide

from app.core.container import Container
from app.core.dependencies import get_current_user
from app.model.user import User
from app.services.user_service import UserService
from app.schema.user_schema import User2FaUpdate, UserOTPPayload


router = APIRouter(
    prefix="/user",
    tags=["User"],
    dependencies=[Depends(get_current_user)]
)


@router.get("", summary="Get a user's info",
            response_model=User)
@inject
def get_user(
    service: UserService = Depends(Provide[Container.user_service]),
    current_user: User = Depends(get_current_user)
):
    """"""
    return current_user


@router.post("/otp/disable",
             summary="Disable user 2fa",
             response_model=User
             )
@inject
def disable_2fa(
    service: UserService = Depends(Provide[Container.user_service]),
    current_user: User = Depends(get_current_user)
):
    """"""
    user = service.disable_user_2fa(current_user.id)

    return user


@router.post("/otp/verify",
             summary="Setup and verify user 2fa",
             response_model=User,
             )
@inject
def verify_2fa(
    otp_info: UserOTPPayload,
    service: UserService = Depends(Provide[Container.user_service]),
    current_user: User = Depends(get_current_user)
):
    """"""
    user = service.verify_user_otp(otp_info.otp, str(current_user.id))

    return user


@router.post("/2fa/update", summary="Updare 2fa type to sms or authenticator")
@inject
def update_2fa(
    user_2fa_info: User2FaUpdate,
    service: UserService = Depends(Provide[Container.user_service]),
    current_user: User = Depends(get_current_user)
):
    """"""

    user = service.update_user_2fa(
        user_2fa_info.authentication_type, str(current_user.id))

    return user
