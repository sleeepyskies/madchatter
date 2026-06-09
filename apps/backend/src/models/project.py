from models.base import BaseSchema


class ProjectResponse(BaseSchema):
    id: int
    label: str
    agent_id: int | None
    agent_label: str | None    
    agent_system_prompt: str | None
    video_ids: list[int]

class CreateProjectRequest(BaseSchema):
    label: str
    agent_id: int
    video_ids: list[int]

class UpdateProjectRequest(BaseSchema):
    label: str | None
    agent_id: int | None
    video_ids: list[int] | None
