from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from api.api_exception import ResourceNotFoundException
from db.models.projects import Project
from models.project import UpdateProjectRequest


class ProjectRepository:
	"""Provides access to the database for any Project related operations."""

	def __init__(self, database: Session):
		self.database = database

	def _raise_not_found(self, project_id: int) -> Project:
		raise ResourceNotFoundException("Projects", project_id)

	def create(self, project: Project) -> Project:
		self.database.add(project)
		self.database.commit()
		self.database.refresh(project)
		return project

	def get(self, project_id: int) -> Project:
		statement = select(Project).where(Project.id == project_id)
		project = self.database.scalar(statement)
		if not project:
			self._raise_not_found(project_id)
		return project

	def list(self) -> list[Project]:
		statement = select(Project)
		return list(self.database.scalars(statement).all())

	def update(self, project_id: int, new: UpdateProjectRequest) -> Project:
		project = self.get(project_id)

		if new.label is not None:
			project.label = new.label
		if new.agent_id is not None:
			project.agent_id = new.agent_id
		if new.knowledge_id is not None:
			project.vector_collection_id = new.knowledge_id
		if new.idle_video_id is not None:
			project.idle_video_id = new.idle_video_id
		if new.enter_video_id is not None:
			project.enter_video_id = new.enter_video_id
		if new.exit_video_id is not None:
			project.exit_video_id = new.exit_video_id
		if new.terms is not None:
			project.terms = new.terms

		self.database.commit()
		return project

	def delete(self, project_id: int) -> None:
		statement = delete(Project).where(Project.id == project_id)
		result = self.database.execute(statement)

		if result.rowcount == 0:
			self._raise_not_found(project_id)

		self.database.commit()
