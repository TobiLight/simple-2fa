#!/usr/bin/env python3
# File: auth_service.py
"""Auth Service"""


from datetime import timedelta
from typing import Optional
from app.core.config import configs
from app.core.exceptions import AuthError, RequestError, RestrictedError, ValidationError
from app.core.security import create_access_token, get_password_hash, \
    verify_password
from app.repository.user_repository import UserRepository
from app.schema.auth_schema import OTPPayload, OTPResponse, Payload, SignIn, SignInResponse, SignInResponse2Fa, SignUp
from app.schema.user_schema import User
from app.model.user import User as UserModel
from app.services.base_service import BaseService
from app.util.util import check_password_strength


class AuthService(BaseService):
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository
        super().__init__(user_repository)

    def sign_up(self, user_info: SignUp) -> User:
        user_info.password = get_password_hash(user_info.password)

        created_user = self.user_repository.create(user_info)

        delattr(created_user, "password")

        return User(**created_user.model_dump())

    def sign_in(self, user_info: SignIn):
        user: Optional[UserModel] = self.user_repository.get_by_email(
            user_info.email)

        if not user:
            raise AuthError(detail="Incorrect email or password")

        if not user.is_active:
            raise AuthError(detail="Account is not active")

        if not verify_password(user_info.password, user.password):
            raise AuthError(detail="Incorrect email or password")

        delattr(user, "password")

        # if user.is_2fa_enabled:
        #     return SignInResponse2Fa(is_2fa_enabled=True, auth_2fa_type=user.auth_2fa_type)
        #     raise RestrictedError(detail="2FA required!")

        payload = Payload(
            id=str(user.id),
            email=user.email,
            name=user.first_name + " " + user.last_name,
        )

        token_lifespan = timedelta(
            minutes=configs.ACCESS_TOKEN_EXPIRE_MINUTES)

        access_token, expiration_datetime = create_access_token(
            payload.model_dump(), token_lifespan)

        sign_in_result = {
            "access_token": access_token,
            "expiration": expiration_datetime,
            "user_info": user,
        }

        return SignInResponse(**sign_in_result)

    def otp_verification(self, payload: OTPPayload):
        user = self.user_repository.verify_otp(payload)

        return user
    
    def logout(self, user_id: str):
        return self.user_repository.logout(user_id)