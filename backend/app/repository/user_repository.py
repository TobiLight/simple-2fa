#!/usr/bin/env python3
# File: user_repository.py
"""User Repository"""


from typing import Callable, Optional
from uuid import UUID, uuid4
import pyotp
from sqlalchemy import String, Uuid, cast
from sqlalchemy.orm import Session
from app.core.exceptions import AuthError, DuplicatedError, RequestError
from app.core.security import verify_password
from app.model.user import AuthType, User
from app.repository.base_repository import BaseRepository
from app.schema.auth_schema import OTPPayload, SignUp
from sqlalchemy.exc import IntegrityError


class UserRepository(BaseRepository):
    def __init__(self, session_factory: Callable[[], Session]):
        self.session_factory = session_factory
        self.model = User

        super().__init__(session_factory, User)

    def get_by_email(self, email: str):
        """"""
        with self.session_factory() as session:
            query = session.query(self.model).filter(
                cast(self.model.email, String) == cast(email, String)).first()

            return query

    def get_by_id(self, user_id: str):
        """"""
        with self.session_factory() as session:
            query = session.query(self.model).filter(
                cast(self.model.id, Uuid) == cast(user_id, Uuid)).first()

            return query

    def user_exists(self, email: str):
        """"""
        user = self.get_by_email(email)

        if user:
            return True

        return False

    def create(self, schema: SignUp) -> User:
        """"""
        with self.session_factory() as session:
            user_2fa_type: Optional[AuthType] = None
            user_enabled_2fa: bool = False

            otp_base32: Optional[str] = None
            otp_auth_url: Optional[str] = None

            if schema.enable_2fa:
                user_enabled_2fa = schema.enable_2fa

            if user_enabled_2fa and schema.authentication_type:
                user_2fa_type = AuthType.Authenticator if schema.authentication_type.lower(
                ) == 'google-authenticator' else AuthType.Sms

            if user_2fa_type == AuthType.Authenticator:
                otp_base32 = pyotp.random_base32()

                otp_auth_url = pyotp.totp.TOTP(otp_base32).provisioning_uri(
                    name=str(schema.email), issuer_name="2fa.com")

            user = self.user_exists(schema.email)

            if user:
                raise DuplicatedError(detail="Account exists!")

            query = self.model(
                id=uuid4(),
                **schema.model_dump(),
                otp_secret=otp_base32,
                otp_auth_url=otp_auth_url,
                is_2fa_enabled=user_enabled_2fa,
                auth_2fa_type=user_2fa_type)
            
            try:
                session.add(query)

                session.commit()

                session.refresh(query)
            except IntegrityError as e:
                raise DuplicatedError(detail=str(e.orig))

            return query

    def check_2fa_status(self, user_email: str) -> bool:
        """Get user's 2fa status"""
        query = self.get_by_email(user_email)

        if not query or query is None:
            raise AuthError(detail="Unauthorized!")

        return query.is_2fa_enabled

    def verify_otp(self, payload: OTPPayload) -> User:
        """"""
        user = self.get_by_email(payload.email)

        if user is None:
            raise AuthError(detail="Invalid OTP or login!")

        if not verify_password(payload.password, user.password):
            raise AuthError(detail="Incorrect email or password")

        totp: Optional[pyotp.TOTP] = None

        is_valid_otp: bool = False

        if user.otp_secret:
            totp = pyotp.TOTP(user.otp_secret)

        if totp is not None:
            is_valid_otp = totp.verify(payload.otp)

        if not is_valid_otp:
            raise AuthError(detail="Invalid OTP or login")

        print("user", user)
        return user

    def disable_2fa(self, user_id: UUID):
        """"""
        with self.session_factory() as session:
            user = session.get(self.model, user_id)

            if user is None or not user:
                raise AuthError(detail="Invalid user")

            if user.id != user_id:
                raise AuthError(detail="Invalid user")

            # query_model = self.model(**schema.model_dump(),
            #                          is_2fa_enabled=schema.enable_2fa)

            # for k, v in query_model.model_dump().items():
            #     if k not in ['id', 'created_at', 'updated_at']:
            #         if k == 'is_2fa_enabled' and v is False:
            #             user.otp_auth_url = None
            #             user.otp_secret = None
            #             user.auth_2fa_type = None
            #             setattr(user, k, v)

            user.otp_auth_url = None
            user.otp_secret = None
            user.auth_2fa_type = None
            user.is_2fa_enabled = False

            try:
                session.commit()
            except:
                raise RequestError(detail="An error has occured")

            return self.get_by_id(str(user.id))

    def enable_2fa(self, user_id: UUID):
        """"""
        with self.session_factory() as session:
            user = session.get(self.model, user_id)

            if user is None or not user:
                raise AuthError(detail="Invalid user")

            if user.id != user_id:
                raise AuthError(detail="Invalid user")

            otp_base32 = pyotp.random_base32()

            otp_auth_url = pyotp.totp.TOTP(otp_base32).provisioning_uri(
                name=str(user.email), issuer_name="2fa.com")

            user.is_2fa_enabled = True
            user.otp_auth_url = otp_auth_url
            user.otp_secret = otp_base32
            user.auth_2fa_type = AuthType.Authenticator

            try:
                session.commit()
            except:
                raise RequestError(detail="An error has occured")

            return self.get_by_id(str(user.id))
