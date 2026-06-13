from db.models.projects import Project
from db.models.videos import Video
from models.project import CreateProjectRequest, ProjectResponse, UpdateProjectRequest
from models.videos import VideoResponse
from repositories.project_repository import ProjectRepository
from repositories.video_repository import VideoRepository
from services.agent_service import AgentService
from settings import settings
from util.file_handler import FileHandler


def map_video_to_response(video: Video) -> VideoResponse:
    return VideoResponse(
        id=video.id,
        label=video.label,
        filename=video.filename,
        description=video.description,
    )


# todo: this class can probably be optimised a little but its fine for now, does have some messy code though

class ProjectService:
    """Handles project related business logic."""

    def __init__(
            self,
            project_repository: ProjectRepository,
            video_repository: VideoRepository,
            agent_service: AgentService,
    ):
        self.project_repository = project_repository
        self.video_repository = video_repository
        self.agent_service = agent_service
        self.file_handler = FileHandler(settings.files_dir)

    def create_project(self, request: CreateProjectRequest) -> ProjectResponse:
        project = self.project_repository.create(Project(
            label=request.label,
            agent_id=request.agent_id,
            vector_collection_id=request.knowledge_id,
            idle_video_id=request.idle_video_id,
            enter_video_id=request.enter_video_id,
            exit_video_id=request.exit_video_id,
        ))

        return self.get_project(project.id)

    def get_project(self, project_id: int) -> ProjectResponse:
        project = self.project_repository.get(project_id)

        videos = [
            map_video_to_response(video) for video in
            self.video_repository.list_for_project(project.id)
        ]

        idle_video = map_video_to_response(
            self.video_repository.get(project.idle_video_id)) if project.idle_video_id else None
        enter_video = map_video_to_response(
            self.video_repository.get(project.enter_video_id)) if project.enter_video_id else None
        exit_video = map_video_to_response(
            self.video_repository.get(project.exit_video_id)) if project.exit_video_id else None

        return ProjectResponse(
            id=project.id,
            label=project.label,
            agent=self.agent_service.get_agent(project.agent_id) if project.agent_id else None,
            knowledge_id=project.vector_collection_id,
            videos=videos,
            idle_video=idle_video,
            enter_video=enter_video,
            exit_video=exit_video,
        )

    def list_projects(self) -> list[ProjectResponse]:
        projects = self.project_repository.list()
        return [self.get_project(project.id) for project in projects]

    def update_project(self, project_id: int, request: UpdateProjectRequest) -> ProjectResponse:
        project = self.project_repository.update(project_id, request)
        return self.get_project(project.id)

    def delete_project(self, project_id: int) -> None:
        project = self.project_repository.get(project_id)
        videos = self.video_repository.list_for_project(project.id)
        for video in videos:
            self.file_handler.delete_file(video.filename)
            self.video_repository.delete(video.id)
        self.project_repository.delete(project_id)
