from enum import StrEnum
from pathlib import Path
import sys

from loguru import logger
from dotenv import find_dotenv, load_dotenv
from numpy import __config__
from pydantic import model_validator
from pydantic_settings import SettingsConfigDict, BaseSettings
from sqlalchemy.orm import base

# keep searching upwards until we find a .env file
if not load_dotenv(find_dotenv()):
	logger.error("Could not load environment, exiting the server.")
	sys.exit(1)

def _is_production_environment() -> bool:
	return getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS')


def _get_base_directory() -> Path:
	if _is_production_environment():
		logger.debug("Running in a PyInstaller bundle")
		path = Path(sys.executable).resolve().parent
		print(path)
		return path
	logger.debug("Running in a python script")
	return Path(__file__).resolve().parent.parent.parent.parent

base_directory = _get_base_directory()


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

	@property
	def is_production(self) -> bool:
		return _is_production_environment()

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
	def voice_model_dir(self) -> Path:
		"""Directory reserved for saving static files to serve."""
		return Path(self.run_dir / "voice-models").absolute()

	@property
	def frontend_dir(self) -> Path:
		"""Directory reserved for storing the frontend build output."""
		return Path(base_directory / "frontend").absolute()

	@property
	def files_dir(self) -> Path:
		"""Directory reserved for saving files to disk. This includes videos and source knowledge file."""
		return Path(self.run_dir / "files").absolute()

	database_url: str = ""
	"""Database connection string."""

	vector_db_url: str = ""
	"""Vector database connection string."""

	@model_validator(mode="after")
	def __resolve_defaults(self) -> "Settings":
		if not self.database_url:
			self.database_url = f"sqlite:///{(self.run_dir / 'database.sqlite')}"
		if not self.vector_db_url:
			self.vector_db_url = f"chroma:///{(self.run_dir / 'chroma_db')}"
		return self



settings = Settings()
"""Globally accessible application settings."""
