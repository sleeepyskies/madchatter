import multiprocessing
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
    settings.tmp_dir.mkdir(parents=True, exist_ok=True)
    settings.static_dir.mkdir(parents=True, exist_ok=True)
    settings.files_dir.mkdir(parents=True, exist_ok=True)

def acquire_lock():
    """
    Ensures the binary has only a single instance running at a time.
    If there is already an instance running, the existing instance will be opened in
    the browser, and the current instance will then shut down.
    """
    # TODO(sky): implement this function. maybe it should go inside of start_server?
    # what do we do if there is a bad shutdown and the file remains somehow?
    # maybe write pid and check name and if running still in the lock file?
    pass

def main():
    """Entry point of the application."""
    try:
        acquire_lock()
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
    multiprocessing.freeze_support() # when building with pyinstaller, this solves the process recursively starting
    sys.exit(main())
