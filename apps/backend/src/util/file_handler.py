import pathlib
import shutil
from pathlib import Path
from typing import BinaryIO

from fastapi import UploadFile

from api.api_exception import InvalidArgumentException


class FileHandler:
    """
    Simple utility class for managing files based in a root directory.
    """

    def __init__(self, root_dir: Path) -> None:
        """Creates a new FileHandler and creates any necessary directories."""

        self.directory = root_dir
        self.directory.mkdir(parents=True, exist_ok=True)

    def create_path(self, filename: str) -> Path:
        """
        Creates a filepath suiting the provided filename.
        Note that the filename should include the extension.
        """
        return Path(self.directory / filename).absolute()

    def create_dir(self, dirname: str) -> Path:
        """Creates a new directory relative to the root directory, and returns the path."""

        path = self.create_path(dirname)
        path.mkdir(parents=True, exist_ok=True)
        return path

    def delete_dir(self, dirname: str) -> None:
        """Deletes a directory and all of its contents."""

        shutil.rmtree(self.create_path(dirname))

    def save_file(self, file: BinaryIO, filename: str) -> Path:
        """
        Saves a new file to the directory.
        """
        file_path = self.create_path(filename)
        with open(file_path, "wb") as dest:
            while content := file.file.read(1024 * 1024):
                dest.write(content)
        return file_path

    def delete_file(self, filename: str) -> None:
        """
        Deletes the file from disk if it exists, otherwise does nothing.
        Note that the filename should include the extension.
        """

        file_path = self.create_path(filename)
        if file_path.exists():
            file_path.unlink()
