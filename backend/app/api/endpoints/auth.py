#!/usr/bin/env python3
# File: auth.py
"""Auth endpoint"""


from typing import Union
from fastapi import APIRouter, Depends, status
from dependency_injector.wiring import inject, Provide
from app.core.container import Container
from app.schema.auth_schema import OTPPayload, OTPResponse, SignIn, SignInResponse, SignInResponse2Fa, SignUp
from app.schema.user_schema import User
from app.services.auth_service import AuthService


router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)


@router.post("/register",
             summary="Sign Up",
             response_model=User,
             status_code=status.HTTP_201_CREATED)
@inject
def sign_up(
        user_info: SignUp,
        service: AuthService = Depends(Provide[Container.auth_service])):
    """"""
    user = service.sign_up(user_info)

    return user


@router.post("/login",
             summary="Login",
             response_model=Union[SignInResponse, SignInResponse2Fa])
@inject
def login(
	user_info: SignIn,
	service: AuthService = Depends(Provide[Container.auth_service])
):
    """"""
    user = service.sign_in(user_info)

    return user


@router.post("/otp/verify",
             summary="Verify OTP",
             response_model=OTPResponse
             )
@inject
def verify_otp(
	payload: OTPPayload,
	service: AuthService = Depends(Provide[Container.auth_service])
):
    """"""
    return service.otp_verification(payload)
