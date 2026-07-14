from fastapi import UploadFile

from db.models.projects import Project
from db.models.videos import Video
from models.project import CreateProjectRequest, ProjectResponse, UpdateProjectRequest, ImportProjectRequest, \
	ImportProjectResponse
from models.videos import VideoResponse
from repositories.knowledge_base_repository import KnowledgeBase
from repositories.project_repository import ProjectRepository
from repositories.video_repository import VideoRepository
from services.agent_service import AgentService
from services.knowledge_service import KnowledgeService
from services.project.project_export_service import ProjectExport, ProjectExportService
from services.project.project_import_service import ProjectImportService
from services.video_service import VideoService
from settings import settings
from util.download_url import create_download_url
from util.file_handler import FileHandler


def map_video_to_response(video: Video) -> VideoResponse:
	return VideoResponse(
		id=video.id,
		label=video.label,
		includes_audio=video.includes_audio,
		download_url=create_download_url(video.filename),
		description=video.description,
	)


# todo: this class can probably be optimised a little but its fine for now, does have some messy code though
class ProjectService:
	"""Handles project related business logic."""

	def __init__(
		self,
		project_repository: ProjectRepository,
		video_repository: VideoRepository,
		video_service: VideoService,
		agent_service: AgentService,
		knowledge_service: KnowledgeService,
	):
		self.project_repository = project_repository
		self.video_repository = video_repository
		self.agent_service = agent_service
		self.knowledge_service = knowledge_service
		self.file_handler = FileHandler(settings.files_dir)
		self.export_service = ProjectExportService(project_repository, video_repository, knowledge_service, agent_service)
		self.import_service = ProjectImportService(project_repository, agent_service, video_service, knowledge_service)

	def create_project(self, request: CreateProjectRequest) -> ProjectResponse:
		project = self.project_repository.create(
			Project(
				label=request.label,
				agent_id=request.agent_id,
				vector_collection_id=request.knowledge_id,
				idle_video_id=request.idle_video_id,
				enter_video_id=request.enter_video_id,
				exit_video_id=request.exit_video_id,
				stt_terms=request.stt_terms,
				stt_model=request.stt_model,
				stt_device=request.stt_device,
				llm_model=request.llm_model
			)
		)

		return self.get_project(project.id)

	def get_project(self, project_id: int) -> ProjectResponse:
		project = self.project_repository.get(project_id)

		videos = [map_video_to_response(video) for video in self.video_repository.list_for_project(project.id)]

		idle_video = (
			map_video_to_response(self.video_repository.get(project.idle_video_id)) if project.idle_video_id else None
		)
		enter_video = (
			map_video_to_response(self.video_repository.get(project.enter_video_id)) if project.enter_video_id else None
		)
		exit_video = (
			map_video_to_response(self.video_repository.get(project.exit_video_id)) if project.exit_video_id else None
		)

		return ProjectResponse(
			id=project.id,
			label=project.label,
			agent=self.agent_service.get_agent(project.agent_id) if project.agent_id else None,
			knowledge_id=project.vector_collection_id,
			videos=videos,
			idle_video=idle_video,
			enter_video=enter_video,
			exit_video=exit_video,
			stt_terms=project.stt_terms,
			stt_model=project.stt_model,
			stt_device=project.stt_device,
			llm_model=project.llm_model
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

	def fetch_knowledge_base(self, project_id: int) -> KnowledgeBase | None:
		project = self.project_repository.get(project_id)
		if project.vector_collection_id is None:
			return None

		return self.knowledge_service.fetch_knowledge_base(project.vector_collection_id)

	def create_export(self, project_id: int) -> ProjectExport:
		return self.export_service.create_export_package(project_id)

	def cleanup_export(self, project_id: int) -> None:
		return self.export_service.cleanup_export(project_id)

	def import_project(self, file: UploadFile) -> ImportProjectResponse:
		return self.import_service.import_package(file)
