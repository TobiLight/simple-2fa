#!/usr/bin/env python3
# File: user_service.py
"""User Service"""


from uuid import UUID
from app.repository.user_repository import UserRepository
from app.services.base_service import BaseService


class UserService(BaseService):
    def __init__(self, user_repository: UserRepository) -> None:
        self.user_repository = user_repository
        super().__init__(user_repository)

    def add(self, schema):
        """"""
        user = self.user_repository.create(schema)

        return user

    def disable_user_2fa(self, user_id: UUID):
        return self.user_repository.disable_2fa(user_id)

    def setup_user_2fa(self, user_id: UUID):
        return self.user_repository.setup_2fa(user_id)
    
    def verify_user_otp(self, otp: str, user_id: str):
        """"""
        return self.user_repository.verify_otp_user(otp, user_id)
