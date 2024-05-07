#!/usr/bin/env python3
# File: base_repository.py
"""Base Repository"""


from typing import Callable
from uuid import UUID

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.core.exceptions import DuplicatedError, NotFoundError


class BaseRepository:
    def __init__(self, session_factory:
                 Callable[[], Session], model) -> None:
        self.session_factory = session_factory

        self.model = model

    def read_by_id(self, id: UUID, eager=False):
        with self.session_factory() as session:
            query = session.query(self.model)

            if eager:
                for eager in getattr(self.model, "eagers", []):
                    query = query.options(
                        joinedload(getattr(self.model, eager)))

            query = query.filter(self.model.id == id).first()

            if not query:
                raise NotFoundError(detail=f"not found id : {id}")
            return query

    def create(self, schema):
        with self.session_factory() as session:
            query = self.model(**schema.dict())

            try:
                session.add(query)

                session.commit()

                session.refresh(query)
            except IntegrityError as e:
                raise DuplicatedError(detail=str(e.orig))

            return query

    def update(self, id: UUID, schema):
        with self.session_factory() as session:
            session.query(self.model).filter(self.model.id == id).update(
                schema.dict(exclude_none=True))

            session.commit()

            return self.read_by_id(id)
