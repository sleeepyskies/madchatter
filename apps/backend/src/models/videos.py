from models.base import BaseSchema


class SimpleVideoResponse(BaseSchema):
    id: int
    label: str
    filename: str
    description: str


class VideoResponse(SimpleVideoResponse):
    file_url: str


class CreateVideoRequest(BaseSchema):
    label: str
    description: str


class UpdateVideoRequest(BaseSchema):
    label: str | None
    description: str | None
