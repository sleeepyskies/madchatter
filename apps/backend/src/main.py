import multiprocessing
import socket
import sys
import threading
import time
import urllib
from enum import IntEnum, unique

import webview
from loguru import logger
from sqlalchemy import Engine
from sqlalchemy.orm import sessionmaker

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
    settings.voice_model_dir.mkdir(parents=True, exist_ok=True)
    settings.files_dir.mkdir(parents=True, exist_ok=True)

def determine_port(preferred: int) -> None:
    """
    Attempts to find a suitable server port.
    If the preferred port is taken, the OS will decide which port to run on.
    """
    if not settings.is_production:
        return settings.server_port

    for port in (preferred, 0):
        with socket.socket() as s:
            try:
                s.bind((settings.server_address, port))
                return s.getsockname()[1]
            except OSError:
                pass

def wait_for_server(timeout_s: int = 10):
    start = time.time()

    while time.time() - start < timeout_s:
        try:
            logger.debug(f"Waiting for {settings.webapp_url}")
            urllib.request.urlopen(settings.webapp_url, timeout=0.5)
            return True
        except Exception:
            time.sleep(0.1)

    raise RuntimeError("Server did not start in time")

def run(engine: Engine, session: sessionmaker):
    """Handles starting the application processes."""
    # import first here to ensure environment is properly setup first
    from api.server import start_server

    def run_server():
        start_server(engine, session)

    def run_client():
        wait_for_server()

        webview.create_window(
            title="MadChatter",
            url=settings.webapp_url,
        )

        webview.start()

    threading.Thread(target=run_server, daemon=True).start()
    run_client()


def main():
    """Entry point of the application."""
    try:
        configure_logging()
        setup_environment()
        engine, session = load_database()
        run(engine, session)

        return ExitCode.SUCCESS

    except Exception as error:
        logger.exception(f"Unhandled application error: {error}")
        return ExitCode.FAILURE


if __name__ == "__main__":
    multiprocessing.freeze_support()  # when building with pyinstaller, this solves the process recursively starting
    sys.exit(main())
