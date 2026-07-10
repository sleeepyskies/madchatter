from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).parent
BACKEND_DIR = ROOT / "apps" / "backend"
FRONTEND_DIR = ROOT / "apps" / "frontend"

def build_backend():
    # first use pyinstaller to create a binary
    python = (
            BACKEND_DIR
            / ".venv"
            / ("Scripts/python.exe" if sys.platform == "win32" else "bin/python")
    )
    subprocess.check_call([str(python), "-m", "PyInstaller", "madchatter.spec"], cwd=BACKEND_DIR)

    # then copy the prod.env to the dist dir
    source_env = ROOT / "prod.env"
    dest_env = BACKEND_DIR / "dist" / "madchatter" / ".env"
    if source_env.exists():
        shutil.copy(source_env, dest_env)

def build_frontend():
    # first build the frontend static files
    subprocess.check_call(["npm", "install"], cwd=FRONTEND_DIR)
    subprocess.check_call(["npm", "run", "build"], cwd=FRONTEND_DIR)

    # then copy to backend so it can serve them
    src = FRONTEND_DIR / "out"
    dst = BACKEND_DIR / "dist" / "madchatter" / "frontend_dist"

    if dst.exists():
        shutil.rmtree(dst)

    shutil.copytree(src, dst)

def cleanup():
    pass

build_backend()
build_frontend()
cleanup()
print("Build complete")
