from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).parent.parent

BACKEND_DIR = ROOT / "apps" / "backend"
FRONTEND_DIR = ROOT / "apps" / "frontend"

DIST_PATH = ROOT / "dist"
WORK_PATH = ROOT / "build"


def build_backend():
    # first, create venv
    subprocess.check_call(["uv", "sync"], cwd=BACKEND_DIR)

    # then use pyinstaller to create a binary
    python = (
            BACKEND_DIR
            / ".venv"
            / ("Scripts/python.exe" if sys.platform == "win32" else "bin/python")
    )

    subprocess.check_call([
        str(python),
        "-m",
        "PyInstaller",
        "madchatter.spec",
        "--distpath",
        DIST_PATH,
        "--workpath",
        WORK_PATH,
        "--clean",
        "--noconfirm",
    ], cwd=BACKEND_DIR)

    # then copy the prod.env to the dist dir
    source_env = ROOT / "prod.env"
    dest_env = DIST_PATH / "madchatter" / ".env"
    if source_env.exists():
        shutil.copy(source_env, dest_env)

def build_frontend():
    # first build the frontend static files
    subprocess.check_call(["npm", "install"], cwd=FRONTEND_DIR)
    subprocess.check_call(["npm", "run", "build"], cwd=FRONTEND_DIR)

    # then copy to backend so it can serve them
    src = FRONTEND_DIR / "out"
    dst = DIST_PATH / "madchatter" / "frontend"

    if dst.exists():
        shutil.rmtree(dst)

    shutil.copytree(src, dst)

def cleanup():
    build_dir = ROOT / "build"
    if build_dir.exists():
        shutil.rmtree(build_dir)

if __name__ == "__main__":
    try:
        build_backend()
        build_frontend()
        cleanup()
        print("Build complete")
    except subprocess.CalledProcessError as e:
        print(f"Build failed during: {e.cmd}")
        sys.exit(1)
