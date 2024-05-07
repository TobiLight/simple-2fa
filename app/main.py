#!/usr/bin/env python3
# File: main.py
"""Event Ticketing entry point"""


from fastapi import FastAPI

from app.core.config import configs
from app.core.container import Container
from app.util.class_object import singleton
from starlette.middleware.cors import CORSMiddleware
from app.api.routes import routers
from starlette.middleware.sessions import SessionMiddleware
from app.core.config import configs


@singleton
class AppCreator:
    def __init__(self):
        # set app default
        self.app = FastAPI(
            title=configs.PROJECT_NAME,
            # openapi_url=f"{configs.API}/openapi.json",
            version="0.0.1",
            description="Two Factor Authentication"
        )

        self.app.add_middleware(
            SessionMiddleware, secret_key=configs.SECRET_KEY)

        # set db and container
        self.container = Container()

        self.db = self.container.db()

        # set cors
        if configs.BACKEND_CORS_ORIGINS:
            self.app.add_middleware(
                CORSMiddleware,
                allow_origins=[str(origin)
                               for origin in configs.BACKEND_CORS_ORIGINS],
                allow_credentials=True,
                allow_methods=["*"],
                allow_headers=["*"],
            )

        # set routes
        @self.app.get("/")
        def root():
            return "2fa service is working"

        self.app.include_router(routers)


app_creator = AppCreator()

app = app_creator.app

db = app_creator.db

print("✅ Up and running...")

container = app_creator.container
