"""
Simple helpers to check existence of certain items.
"""

import shutil
from pathlib import Path


def require_tool(name: str, hint: str) -> None:
    """Verifies the existence of a tool providing a hint on failure."""
    if shutil.which(name) is None:
        raise RuntimeError(f"required tool '{name}' not found on PATH. {hint}")


def require_dir(path: Path, description: str) -> None:
    """Verifies the existence of a file."""
    if not path.is_dir():
        raise RuntimeError(f"{description} not found at {path}")


def require_file(path: Path, description: str) -> None:
    """Verifies the existence of a directory."""
    if not path.is_file():
        raise RuntimeError(f"{description} not found at {path}")
