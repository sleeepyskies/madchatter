from db.models.projects import Project
from models.project import CreateProjectRequest, ProjectResponse, UpdateProjectRequest
from repositories.project_repository import ProjectRepository, UpdateProject
from repositories.video_repository import VideoRepository


class ProjectService:
    """Handles project related business logic."""

    def __init__(self, scene_repository: ProjectRepository, video_repository: VideoRepository):
        self.project_repository = scene_repository
        self.video_repository = video_repository

    def create_project(self, request: CreateProjectRequest) -> ProjectResponse:
        videos = []

        if request.video_ids:
            # todo: not the most efficient here as we first get every single video and then filter
            videos = list(
                filter(
                    lambda v: v.id in request.video_ids,
                    self.video_repository.list()
                )
            )

        project = self.project_repository.create(Project(
            label=request.label,
            agent_id=request.agent_id,
            videos=videos,
        ))

        return ProjectResponse(
            id=project.id,
            label=project.label,
            agent_id=project.agent_id,
            video_ids=[v.id for v in project.videos],
        )

    def get_project(self, project_id: int) -> ProjectResponse:
        project = self.project_repository.get(project_id)
        return ProjectResponse(
            id=project.id,
            label=project.label,
            agent_id=project.agent_id,
            video_ids=[video.id for video in project.videos],
        )

    def list_projects(self) -> list[ProjectResponse]:
        projects = self.project_repository.list()
        return [ProjectResponse(
            id=s.id,
            label=s.label,
            agent_id=s.agent_id,
            video_ids=[video.id for video in s.videos],
        ) for s in projects]

    def update_project(self, project_id: int, request: UpdateProjectRequest) -> ProjectResponse:
        project = self.project_repository.update(project_id, UpdateProject(
            label=request.label,
            agent_id=request.agent_id,
            video_ids=request.video_ids,
        ))

        return ProjectResponse(
            id=project.id,
            label=project.label,
            agent_id=project.agent_id,
            video_ids=[video.id for video in project.videos],
        )

    def delete_project(self, project_id: int) -> None:
        self.project_repository.delete(project_id)
