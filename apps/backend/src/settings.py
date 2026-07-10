from enum import StrEnum
from pathlib import Path
import sys

from loguru import logger
from dotenv import find_dotenv, load_dotenv
from pydantic_settings import SettingsConfigDict, BaseSettings
from sqlalchemy.orm import base

# keep searching upwards until we find a .env file
if not load_dotenv(find_dotenv()):
	logger.error("Could not load environment, exiting the server.")
	sys.exit(1)

def get_base_directory() -> Path:
	if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
		logger.debug("Running in a PyInstaller bundle")
		return Path(sys.executable).resolve().parent
	return Path(__file__).resolve().parent.parent.parent.parent


base_directory = get_base_directory()


class Env(StrEnum):
	"""Describes the current runtime environment."""

	DEV = "DEV"
	PROD = "PROD"


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

	model_config = SettingsConfigDict(env_prefix="MC_")

	env: Env
	"""Application runtime environment."""

	log_level: LogLevel = LogLevel.WARNING
	"""Logging verbosity level."""

	server_address: str
	"""Host address for the server."""

	server_port: int
	"""Server port."""

	@property
	def webapp_url(self) -> str:
		"""The URL the web app can be viewed under."""
		return f"http://{self.server_address}:{self.server_port}"

	database_url: str
	"""Database connection string."""

	vector_db_url: str
	"""Vector database connection string."""

	api_prefix: str = "/api"
	"""API prefix for all API endpoints."""

	@property
	def run_dir(self) -> Path:
		"""Path to the runtime directory. Used for persistence of data."""
		return (base_directory / "run").absolute()

	@property
	def tmp_dir(self) -> Path:
		"""Path to the tmp directory. Used for temporary persistence of data. Do not trust any files here will remain."""
		return Path(self.run_dir / "tmp").absolute()

	@property
	def static_dir(self) -> Path:
		"""Directory reserved for saving static files to serve."""
		return (base_directory / "static").absolute()

	@property
	def frontend_dir(self) -> Path:
		"""Directory reserved for storing the frontend build output."""
		return (base_directory / "frontend_dist").absolute()

	@property
	def files_dir(self) -> Path:
		"""Directory reserved for saving files to disk. This includes videos and source knowledge file."""
		return Path(self.run_dir / "files").absolute()

settings = Settings()
"""Globally accessible application settings."""
