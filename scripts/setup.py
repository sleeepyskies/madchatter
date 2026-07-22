"""
Utility script for setting up a fresh instance of Mad Chatter.

This is not required, but can be used to install runtime dependencies,
fetch default Ollama models, and download Piper voices.

Note this script assumes it is being run from the installation directory.
"""

import argparse
import subprocess
import sys
from pathlib import Path

from util import cli
from util.require import require_tool, has_tool


ROOT = Path(__file__).parent.parent

EMBEDDINGS_MODEL = "jina/jina-embeddings-v2-base-de"
LLAMA3_2_MODEL = "llama3.2"

PIPER_MODELS = [
    (
        "de",
        "de/de_DE/thorsten/medium",
        [
            "de_DE-thorsten-medium.onnx",
            "de_DE-thorsten-medium.onnx.json",
        ],
    ),
    (
        "en",
        "en/en_GB/alba/medium",
        [
            "en_GB-alba-medium.onnx",
            "en_GB-alba-medium.onnx.json",
        ],
    ),
]

PIPER_VOICE_DIR = ROOT / "run" / "voice-models"

PIPER_BASE_URL = (
    "https://huggingface.co/rhasspy/piper-voices/"
    "resolve/main"
)


def install_ollama() -> None:
    """Install Ollama if it is missing."""
    cli.step("Checking Ollama")

    if has_tool("ollama"):
        cli.ok("Ollama already installed")
        return

    cli.info("Installing Ollama")

    if sys.platform == "win32":
        cli.run(
            [
                "winget",
                "install",
                "--id",
                "Ollama.Ollama",
                "--silent",
                "--accept-package-agreements",
                "--accept-source-agreements",
            ],
            description="Installing Ollama with winget",
        )
    else:
        cli.run(
            ["sh", "-c", "curl -fsSL https://ollama.com/install.sh | sh"],
            description="Installing Ollama",
        )

    require_tool(
        "ollama",
        "Install Ollama from https://ollama.com/download",
    )

    cli.ok("Ollama installed")


def pull_ollama_model(model: str) -> None:
    """Pull an Ollama model."""
    cli.step(f"Fetching Ollama model: {model}")

    cli.run(
        ["ollama", "pull", model],
        description=f"Pulling {model}",
    )

    cli.ok(f"Model available: {model}")


def download_file(url: str, destination: Path) -> None:
    """Download a file."""
    destination.parent.mkdir(parents=True, exist_ok=True)

    cli.run(
        [
            "curl",
            "-L",
            "-o",
            str(destination),
            url,
        ],
        description=f"Downloading {destination.name}",
    )


def download_piper_models() -> None:
    """Download required Piper TTS models."""
    cli.step("Fetching Piper voices")

    for language, model_path, files in PIPER_MODELS:
        voice_dir = PIPER_VOICE_DIR / language

        for filename in files:
            url = (
                f"{PIPER_BASE_URL}/"
                f"{model_path}/"
                f"{filename}"
            )

            destination = voice_dir / filename

            if destination.exists():
                cli.info(f"Already exists: {destination}")
                continue

            download_file(url, destination)

    cli.ok("Piper voices available")


def pull_required_models() -> None:
    """Pull models required for Mad Chatter."""
    pull_ollama_model(EMBEDDINGS_MODEL)


def pull_default_models() -> None:
    """Pull optional default models."""
    pull_ollama_model(LLAMA3_2_MODEL)
    download_piper_models()


def check_dependencies() -> None:
    """Verify required runtime dependencies."""
    cli.step("Checking dependencies")

    require_tool(
        "ollama",
        "Install Ollama from https://ollama.com/download",
    )

    require_tool(
        "curl",
        "Install curl from your package manager",
    )

    cli.ok("Required tools available")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Fetch Mad Chatter runtime dependencies."
    )

    parser.add_argument(
        "--defaults",
        "-d",
        action="store_true",
        help="Download default models such as llama3.2.",
    )

    args = parser.parse_args()

    try:
        install_ollama()
        check_dependencies()

        pull_required_models()

        if args.defaults:
            pull_default_models()

        cli.ok("Dependencies ready")
        return 0

    except RuntimeError as e:
        cli.fail(f"Dependency setup failed: {e}")
        return 1

    except subprocess.CalledProcessError as e:
        cli.fail(f"Command failed: {' '.join(e.cmd)}")
        return 1

    except KeyboardInterrupt:
        cli.fail("Setup cancelled by user")
        return 1


if __name__ == "__main__":
    sys.exit(main())
