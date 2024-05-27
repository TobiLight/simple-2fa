#!/usr/bin/env python3
# File: config.py
"""Config"""


import os
from typing import List, Optional
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

ENV: str = ""


class Configs(BaseSettings):
    # base
    ENV: str = os.getenv("ENV", "dev")
    PROJECT_NAME: str = "2fa"
    ENV_DATABASE_MAPPER: dict = {
        "prod": "postgresql_2ocd",
        "stage": "2fa_stage",
        "dev": "postgresql_2ocd",
        "test": "2fa_test",
    }
    DB_ENGINE_MAPPER: dict = {
        "postgresql": "postgresql",
        "mysql": "mysql+mysqldb",
    }

    PROJECT_ROOT: str = os.path.dirname(os.path.dirname(
        os.path.dirname(os.path.abspath(__file__))))

    # date
    DATETIME_FORMAT: str = "%Y-%m-%dT%H:%M:%S"
    DATE_FORMAT: str = "%Y-%m-%d"

    # auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    # 60 minutes * 24 hours * 30 days = 30 days
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    # database
    DB: str = os.getenv("DB", "postgresql")
    DB_USER: Optional[str] = os.getenv("DB_USER")
    DB_PASSWORD: Optional[str] = os.getenv("DB_PASSWORD")
    DB_HOST: Optional[str] = os.getenv("DB_HOST")
    DB_PORT: str = os.getenv("DB_PORT", "3306")
    DB_ENGINE: str = DB_ENGINE_MAPPER.get(DB, "postgresql")

    DATABASE_URI_FORMAT: str = "{db_engine}://{user}:{password}@{host}:{port}/{database}"

    DATABASE_URI: str = "{db_engine}://{user}:{password}@{host}:{port}/{database}".format(
        db_engine=DB_ENGINE,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
        database=ENV_DATABASE_MAPPER[ENV],
    )

    class Config:
        case_sensitive = True
        # env_file = 'app/.env'


class TestConfigs(Configs):
    ENV: str = "test"


configs = Configs()

if ENV == "prod":
    pass
elif ENV == "stage":
    pass
elif ENV == "test":
    setting = TestConfigs()
