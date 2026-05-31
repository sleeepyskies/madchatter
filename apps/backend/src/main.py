import sys
from enum import IntEnum, unique

from api.server import start_server
from db.database import load_database
from loguru import logger

from log import configure_logging


@unique
class ExitCode(IntEnum):
    """App exit codes."""
    SUCCESS = 0
    FAILURE = 1


def main():
    """Entry point of the application."""
    try:
        configure_logging()
        engine, SessionLocal = load_database()
        start_server(engine, SessionLocal)

        return ExitCode.SUCCESS

    except Exception as error:
        logger.exception(f"Unhandled application error: {error}")
        return ExitCode.FAILURE


if __name__ == "__main__":
    sys.exit(main())
