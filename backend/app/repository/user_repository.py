#!/usr/bin/env python3
# File: user_repository.py
"""User Repository"""


from typing import Callable, Optional
from uuid import UUID, uuid4
import pyotp
from requests import session
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

            otp_base32 = pyotp.random_base32()

            otp_auth_url = pyotp.totp.TOTP(otp_base32).provisioning_uri(
                name=str(schema.email), issuer_name="2fa.com")

            user = self.user_exists(schema.email)

            if user:
                raise DuplicatedError(detail="Account exists!")

            auth_type = AuthType.Sms if schema.authentication_type is not None and schema.authentication_type.lower(
            ) == 'sms' else AuthType.Authenticator

            query = self.model(
                id=uuid4(),
                **schema.model_dump(),
                otp_secret=otp_base32,
                otp_auth_url=otp_auth_url,
                is_2fa_enabled=True,
                auth_2fa_type=auth_type)

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

    def verify_otp(self, payload: OTPPayload):
        """"""
        with self.session_factory() as session:
            query = session.query(self.model).filter(
                cast(self.model.email, String) == cast(payload.email, String)).first()

            if query is not None:
                totp: Optional[pyotp.TOTP] = None

                is_valid_otp: bool = False

                if query.otp_secret:
                    totp = pyotp.TOTP(query.otp_secret)

                if totp is not None:
                    is_valid_otp = totp.verify(payload.otp)

                if not is_valid_otp:
                    raise AuthError(detail="Invalid OTP or login")

                query.is_otp_verified = True

                try:
                    session.commit()

                    session.refresh(query)
                except IntegrityError as e:
                    raise DuplicatedError(detail=str(e.orig))

                return query

            return query

    def verify_otp_user(self, otp: str, user_id: str) -> Optional[User]:
        """"""
        with self.session_factory() as session:
            query = session.get(self.model, user_id)

            if query is not None and query.auth_2fa_type and query.auth_2fa_type.lower() == 'sms':
                query.is_2fa_setup = True
                query.is_otp_verified = False

                try:
                    session.commit()

                    session.refresh(query)
                except IntegrityError as e:
                    raise DuplicatedError(detail=str(e.orig))

                return query

            if query is not None:
                totp: Optional[pyotp.TOTP] = None

                is_valid_otp: bool = False

                if query.otp_secret:
                    totp = pyotp.TOTP(query.otp_secret)

                if totp is not None:
                    is_valid_otp = totp.verify(otp)

                if not is_valid_otp:
                    raise AuthError(detail="Invalid OTP or login")

                query.is_2fa_setup = True
                query.is_otp_verified = True

                try:
                    session.commit()

                    session.refresh(query)
                except IntegrityError as e:
                    raise DuplicatedError(detail=str(e.orig))

                return query

            return query

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

    def setup_2fa(self, user_id: UUID):
        """"""
        with self.session_factory() as session:
            user = session.get(self.model, user_id)

            if user is None or not user:
                raise AuthError(detail="Invalid user")

            if user.id != user_id:
                raise AuthError(detail="Invalid user")

            user.is_2fa_setup = True

            try:
                session.commit()

                session.refresh(user)
            except:
                raise RequestError(detail="An error has occured")

            return self.get_by_id(str(user.id))

    def otp_is_verified(self, user_id: str):
        with self.session_factory() as session:
            query = session.query(self.model).filter(
                cast(self.model.id, Uuid) == cast(user_id, Uuid)).first()

            if query is not None:
                query.is_2fa_setup = True

                try:
                    session.commit()
                except IntegrityError as e:
                    raise DuplicatedError(detail=str(e.orig))

            return query

    def update_2fa_user(self, authentication_type: str, user_id: str):
        """"""
        with self.session_factory() as session:
            query = session.get(self.model, user_id)

            if query:
                if authentication_type == 'SMS':
                    query.auth_2fa_type = AuthType.Sms
                else:
                    query.auth_2fa_type = AuthType.Authenticator
                try:
                    session.commit()

                    session.refresh(query)
                except IntegrityError as e:
                    raise DuplicatedError(detail=str(e.orig))

            return query

    def logout(self, user_id: str):
        """"""
        with self.session_factory() as session:
            query = session.get(self.model, user_id)

            if query:
                query.is_otp_verified = False

                try:
                    session.commit()

                    session.refresh(query)
                except IntegrityError as e:
                    raise DuplicatedError(detail=str(e.orig))

                return True

            return False
