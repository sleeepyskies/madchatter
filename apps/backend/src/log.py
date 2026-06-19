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
            frame = frame.f_back  # type: ignore[assignment]
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )


def configure_logging() -> None:
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

    for name in (
            "uvicorn.middleware.message_logger",
            "uvicorn.protocols.http.httptools_impl",
            "python_multipart.multipart",
    ):
        lg = logging.getLogger(name)
        lg.handlers = []
        lg.propagate = False
        lg.setLevel(logging.WARNING)

    noise_filter = [
        "uvicorn.middleware.message_logger",
        "uvicorn.protocols.http.httptools_impl",
        "uvicorn.lifespan",
        "python_multipart.multipart",
        "asyncio.proactor_events",
    ]

    def log_filter(record, base_condition) -> bool:
        if any(noisy in record["name"] for noisy in noise_filter) or record["level"].name == "TRACE":
            return False
        return base_condition(record)

    logger.remove()
    logger.add(
        sys.stdout,
        level=settings.log_level,
        filter=lambda r: log_filter(r, lambda x: x["level"].no < logging.WARNING),
        enqueue=True,
        diagnose=False,
    )
    logger.add(
        sys.stderr,
        level=settings.log_level,
        filter=lambda r: log_filter(r, lambda x: x["level"].no >= logging.WARNING),
        enqueue=True,
        diagnose=False,
    )
