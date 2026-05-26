from models.base import BaseSchema


class SceneResponse(BaseSchema):
    id: int
    label: str
    agent_id: int | None
    video_ids: list[int]

class CreateSceneRequest(BaseSchema):
    label: str
    agent_id: int
    video_ids: list[int]

class UpdateSceneRequest(BaseSchema):
    label: str | None
    agent_id: int | None
    video_ids: list[int] | None
