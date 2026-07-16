"""
Simple cli utils for logging more structure messages when performing tasks.
"""

import subprocess
import sys
from typing import Sequence


def step(msg: str) -> None:
    """Print a step indicator."""
    print(f"\n\033[1;34m==>\033[0m {msg}")


def info(msg: str) -> None:
    """Print info message indented."""
    print(f"    {msg}")


def ok(msg: str) -> None:
    """Print success message."""
    print(f"\033[1;32m✓\033[0m {msg}")


def fail(msg: str) -> None:
    """Print to stderr."""
    print(f"\033[1;31m✗ {msg}\033[0m", file=sys.stderr)


def run(args: Sequence[str], cwd=None, description: str | None = None) -> None:
    """Run a command with log details."""
    if description:
        step(description)

    try:
        subprocess.run(
            args,
            cwd=cwd,
            check=True,
        )
    except subprocess.CalledProcessError as e:
        fail(f"Command failed: {' '.join(args)}")
        raise RuntimeError(f"Build step failed with exit code {e.returncode}") from e
