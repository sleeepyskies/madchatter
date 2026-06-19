from models.base import BaseSchema


class VideoResponse(BaseSchema):
    id: int
    label: str
    description: str
    includes_audio: bool
    download_url: str


class CreateVideoRequest(BaseSchema):
    label: str
    description: str
    project_id: int
    includes_audio: bool


class UpdateVideoRequest(BaseSchema):
    label: str | None
    description: str | None
    includes_audio: bool | None
