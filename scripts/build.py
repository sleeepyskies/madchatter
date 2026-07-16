"""
Build script for madchatter.
Bundles the backend and frontend together into a binary.
"""

import shutil
import subprocess
import sys
from pathlib import Path

from util import cli
from util.require import require_tool, require_dir, require_file

ROOT = Path(__file__).parent.parent

BACKEND_DIR = ROOT / "apps" / "backend"
FRONTEND_DIR = ROOT / "apps" / "frontend"

DIST_PATH = ROOT / "dist"
WORK_PATH = ROOT / "build"
DIST_APP_DIR = DIST_PATH / "madchatter"

UTIL_DIR = ROOT / "scripts" / "util"
SETUP_SCRIPT = ROOT / "scripts" / "setup.py"

PYTHON_VENV = (
    BACKEND_DIR
    / ".venv"
    / (  # ty windows
        "Scripts/python.exe" if sys.platform == "win32" else "bin/python"
    )
)


def check_backend_dependencies():
    cli.step("Checking backend dependencies")
    require_tool(
        "uv", "Install it from https://docs.astral.sh/uv/getting-started/installation/"
    )
    require_dir(BACKEND_DIR, "Backend directory")
    require_file(BACKEND_DIR / "pyproject.toml", "Backend pyproject.toml")
    require_file(BACKEND_DIR / "madchatter.spec", "PyInstaller spec file")
    cli.ok("uv found, backend project files present")


def check_frontend_dependencies() -> None:
    cli.step("Checking frontend dependencies")
    require_tool("npm", "Install Node.js from https://nodejs.org/")
    require_dir(FRONTEND_DIR, "Frontend directory")
    require_file(FRONTEND_DIR / "package.json", "Frontend package.json")
    cli.ok("npm found, frontend project files present")


def build_backend() -> None:
    cli.step("Building backend")

    cli.info("Syncing Python environment with uv")
    cli.run(["uv", "sync"], cwd=BACKEND_DIR, description="uv sync")

    if not PYTHON_VENV.exists():
        raise RuntimeError(
            f"expected venv python at {PYTHON_VENV} after 'uv sync', but it's missing"
        )

    cli.info("Running PyInstaller")
    cli.run(
        [
            str(PYTHON_VENV),
            "-m",
            "PyInstaller",
            "madchatter.spec",
            "--distpath",
            str(DIST_PATH),
            "--workpath",
            str(WORK_PATH),
            "--clean",
            "--noconfirm",
        ],
        cwd=BACKEND_DIR,
        description="PyInstaller build",
    )

    source_env = ROOT / "prod.env"
    if source_env.exists():
        dest_env = DIST_APP_DIR / ".env"
        if not DIST_APP_DIR.is_dir():
            raise RuntimeError(
                f"PyInstaller did not produce expected output dir {DIST_APP_DIR}"
            )
        shutil.copy(source_env, dest_env)
        cli.ok(f"Copied prod.env -> {dest_env}")
    else:
        cli.info("No prod.env found at repo root, skipping env copy")

    cli.ok("Backend build complete")


def build_frontend() -> None:
    cli.step("Building frontend")

    cli.info("Installing npm dependencies")
    cli.run(["npm", "install"], cwd=FRONTEND_DIR, description="npm install")

    cli.info("Running frontend build")
    cli.run(["npm", "run", "build"], cwd=FRONTEND_DIR, description="npm run build")

    src = FRONTEND_DIR / "out"
    if not src.is_dir():
        raise RuntimeError(
            f"expected frontend build output at {src}, but it's missing "
            "(check the frontend build config's output directory)"
        )

    dst = DIST_APP_DIR / "frontend"
    if dst.exists():
        shutil.rmtree(dst)
    shutil.copytree(src, dst)
    cli.ok(f"Copied frontend build -> {dst}")


def copy_scripts() -> None:
    """Copy setup scripts and utilities into dist directory."""
    cli.step("Copying setup utilities")

    dst_scripts = DIST_APP_DIR / "scripts"
    dst_util = dst_scripts / "util"

    if dst_scripts.exists():
        shutil.rmtree(dst_scripts)

    dst_scripts.mkdir(parents=True)

    shutil.copytree(UTIL_DIR, dst_util)

    shutil.copy(
        SETUP_SCRIPT,
        dst_scripts / "setup.py",
    )

    cli.ok("Copied setup.py and util directory")


def cleanup() -> None:
    cli.step("Cleaning up")
    if WORK_PATH.exists():
        shutil.rmtree(WORK_PATH)
        cli.ok(f"Removed temp work dir {WORK_PATH}")
    else:
        cli.info("Nothing to clean")


def main() -> int:
    try:
        check_backend_dependencies()
        check_frontend_dependencies()

        build_backend()
        build_frontend()
        copy_scripts()

        cleanup()
        cli.step("Build complete")
        cli.ok(f"Output available at {DIST_APP_DIR}")
        return 0

    except RuntimeError as e:
        cli.fail(f"Build failed: {e}")
        return 1
    except subprocess.CalledProcessError as e:
        cli.fail(f"Build failed while running: {' '.join(e.cmd)}")
        return 1
    except KeyboardInterrupt:
        cli.fail("Build cancelled by user")
        return 1


if __name__ == "__main__":
    sys.exit(main())
