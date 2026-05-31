import sys
import logging

from loguru import logger
from settings import Settings, settings


class LogInterceptHandler(logging.Handler):
    """Redirects stdlib logging to go through loguru."""

    def emit(self, record: logging.LogRecord) -> None:
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = str(record.levelno)

        frame, depth = logging.currentframe(), 2
        while frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())


def configure_logging():
    """
    Configures logging for the application.
    Intercepts all stdlib logging, routes uvicorn logging
    and splits stdout and stderr by level.
    """
    logging.getLogger().handlers = [LogInterceptHandler()]

    for name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        logging.getLogger(name).handlers = [LogInterceptHandler()]

    logger.remove()

    logger.add(
        sys.stdout,
        level=settings.log_level,
        filter=lambda r: r["level"].no < logging.WARNING,
    )

    logger.add(
        sys.stderr,
        level=settings.log_level,
        filter=lambda r: r["level"].no >= logging.WARNING,
    )
