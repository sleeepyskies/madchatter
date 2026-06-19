from settings import settings


def create_download_url(filename: str) -> str:
    """Creates a download url for the given filename assuming it is located in the /files directory."""
    return f"{settings.url_string}/files/{filename}"

