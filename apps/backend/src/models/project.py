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
    agent_id: int | None = None
    knowledge_id: int | None = None
    idle_video_id: int | None = None
    enter_video_id: int | None = None
    exit_video_id: int | None = None


class UpdateProjectRequest(BaseSchema):
    label: str | None = None
    agent_id: int | None = None
    knowledge_id: int | None = None
    idle_video_id: int | None = None
    enter_video_id: int | None = None
    exit_video_id: int | None = None
