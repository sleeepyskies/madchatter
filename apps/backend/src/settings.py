from enum import StrEnum
from typing import Literal

from pydantic_settings import SettingsConfigDict, BaseSettings


class Env(StrEnum):
    """Describes the current runtime environment."""
    DEV = "DEV"
    PROD = "PROD"
    TEST = "TEST"


LogLevel = Literal["TRACE", "DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]


class Settings(BaseSettings):
    """Application configuration loaded from the environment."""
    model_config = SettingsConfigDict(
        env_prefix="MC_",
        env_file="./../../.env",  # at monorepo root
    )

    env: Env = Env.DEV
    """Application runtime environment."""

    log_level: LogLevel = "INFO"
    """Logging verbosity level."""

    server_address: str
    """Host address for the server."""

    server_port: int
    """Server port."""

    database_url: str
    """Database connection string."""

    vector_db_url: str
    """Vector database connection string."""




def load_settings() -> Settings:
    """Load application settings from environment and .env file."""
    return Settings()

settings = load_settings()
"""Globally accessible application settings."""
