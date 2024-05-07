#!/usr/bin/env python3
# File: user_service.py
"""User Service"""


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

    def is_2fa_enabled(self, user_email: str) -> bool:
        return self.user_repository.check_2fa_status(user_email)
