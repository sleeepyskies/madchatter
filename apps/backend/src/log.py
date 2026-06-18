import logging
import sys

from loguru import logger

from settings import settings


class LogInterceptHandler(logging.Handler):
    """Redirects stdlib logging to go through loguru."""

    def emit(self, record: logging.LogRecord) -> None:
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = str(record.levelno)

        frame, depth = sys._getframe(6), 6
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )


def configure_logging():
    intercept = LogInterceptHandler()

    root = logging.getLogger()
    root.handlers = [intercept]
    root.setLevel(0)

    for name in (
            "uvicorn",
            "uvicorn.error",
            "uvicorn.access",
            "sqlalchemy.engine",
            "sqlalchemy.engine.Engine",
    ):
        lg = logging.getLogger(name)
        lg.handlers = [intercept]
        lg.propagate = False
        lg.setLevel(0)

    logger.remove()
    logger.add(
        sys.stdout,
        level=settings.log_level,
        filter=lambda r: r["level"].no < logging.WARNING,
        enqueue=True,
        diagnose=False,
    )
    logger.add(
        sys.stderr,
        level=settings.log_level,
        filter=lambda r: r["level"].no >= logging.WARNING,
        enqueue=True,
        diagnose=False,
    )
