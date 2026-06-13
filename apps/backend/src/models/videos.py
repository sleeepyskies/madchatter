from models.base import BaseSchema


class VideoResponse(BaseSchema):
    id: int
    label: str
    filename: str
    description: str


class CreateVideoRequest(BaseSchema):
    label: str
    description: str
    project_id: int


class UpdateVideoRequest(BaseSchema):
    label: str | None
    description: str | None
