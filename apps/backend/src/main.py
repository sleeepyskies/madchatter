import sys
from enum import IntEnum, unique

from loguru import logger

from db.database import load_database
from log import configure_logging
from settings import settings


@unique
class ExitCode(IntEnum):
    """App exit codes."""
    SUCCESS = 0
    FAILURE = 1


def setup_environment():
    """Makes sure all required directories exist on disk before starting."""
    logger.debug("Setting up environment.")
    settings.run_dir.mkdir(parents=True, exist_ok=True)
    settings.static_dir.mkdir(parents=True, exist_ok=True)
    settings.files_dir.mkdir(parents=True, exist_ok=True)


def main():
    """Entry point of the application."""
    try:
        configure_logging()

        setup_environment()

        engine, SessionLocal = load_database()

        # import first here to ensure environment is properly setup first
        from api.server import start_server
        start_server(engine, SessionLocal)

        return ExitCode.SUCCESS

    except Exception as error:
        logger.exception(f"Unhandled application error: {error}")
        return ExitCode.FAILURE


if __name__ == "__main__":
    sys.exit(main())
