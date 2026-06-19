from models.agent import AgentResponse
from models.base import BaseSchema
from models.videos import VideoResponse


class ProjectResponse(BaseSchema):
    id: int
    label: str
    agent: AgentResponse | None
    videos: list[VideoResponse]
    knowledge_id: int | None
    idle_video: VideoResponse | None
    enter_video: VideoResponse | None
    exit_video: VideoResponse | None


class CreateProjectRequest(BaseSchema):
    label: str
    agent_id: int | None
    knowledge_id: int | None
    idle_video_id: int | None
    enter_video_id: int | None
    exit_video_id: int | None


class UpdateProjectRequest(BaseSchema):
    label: str | None
    agent_id: int | None
    knowledge_id: int | None
    idle_video_id: int | None
    enter_video_id: int | None
    exit_video_id: int | None
