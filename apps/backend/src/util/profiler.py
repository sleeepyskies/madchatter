import time
from contextlib import contextmanager
from typing import Generator

from loguru import logger


@contextmanager
def profile(name: str) -> Generator[None, None, None]:
    """
    Profiles a code block,

    Example:
    with profile("example"):
        sleep(1)

    ==> prints: [PROFILED] example: 1s
    """
    start = time.perf_counter()
    yield
    logger.debug(f"[PROFILE] {name}: {time.perf_counter() - start:.4f}s")
