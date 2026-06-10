from dataclasses import dataclass

from sqlalchemy import select, delete
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload

from api.api_exception import ResourceNotFoundException
from db.models.projects import Project
from db.models.videos import Video

@dataclass
class UpdateProject:
    label: str | None
    agent_id: int | None
    video_ids: list[int] | None


class ProjectRepository:
    """Provides access to the database for any Project related operations."""

    def __init__(self, database: Session):
        self.database = database

    def create(self, project: Project) -> Project:
        self.database.add(project)
        self.database.commit()
        self.database.refresh(project)
        return project

    def get(self, project_id: int) -> Project:
        project = self.database.get(Project, project_id)
        if not project:
            raise ResourceNotFoundException("Projects", project_id)
        return project

    def list(self) -> list[Project]:
        # return list(self.database.scalars(select(Project)).all())
        stmt = select(Project).options(
            joinedload(Project.agent)
        )
        return list(self.database.scalars(stmt).all())

    def update(self, project_id: int, new: UpdateProject) -> Project:
        project = self.get(project_id)

        if new.agent_id is not None:
            project.agent_id = new.agent_id
        if new.label is not None:
            project.label = new.label
        if new.video_ids is not None:
            new_videos = self.database.query(Video).filter(Video.id.in_(new.video_ids)).all()
            project.videos = new_videos
        
        self.database.commit()
        self.database.refresh(project)
        return project

    def delete(self, project_id: int) -> None:
        project = self.get(project_id)
        self.database.delete(project)
        self.database.commit()
