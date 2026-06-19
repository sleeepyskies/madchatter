from enum import StrEnum
from pathlib import Path

from pydantic_settings import SettingsConfigDict, BaseSettings


class Env(StrEnum):
    """Describes the current runtime environment."""
    DEV = "DEV"
    PROD = "PROD"
    TEST = "TEST"


class LogLevel(StrEnum):
    """Logging levels."""
    TRACE = "TRACE"
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class Settings(BaseSettings):
    """
    Application configuration. Partially loaded from environment as well as default values.
    """
    model_config = SettingsConfigDict(
        env_prefix="MC_",
        env_file="./../../.env",  # at monorepo root
    )

    env: Env = Env.DEV
    """Application runtime environment."""

    log_level: LogLevel = LogLevel.INFO
    """Logging verbosity level."""

    server_address: str
    """Host address for the server."""

    server_port: int
    """Server port."""

    @property
    def url_string(self) -> str:
        """URL string of the server."""
        return f"http://{self.server_address}:{self.server_port}"

    database_url: str
    """Database connection string."""

    vector_db_url: str
    """Vector database connection string."""

    api_prefix: str = "/api"
    """API prefix for all API endpoints."""

    run_dir: Path = Path("./run")
    """Path to the runtime directory. Used for persistence of data."""

    files_dir: Path = run_dir / "files"
    """Directory reserved for saving files to disk. This includes videos and source knowledge file."""

    static_dir: Path = Path("./static")
    """Directory reserved for saving static files to serve."""


settings = Settings()  # type: ignore[call-arg]
"""Globally accessible application settings."""
