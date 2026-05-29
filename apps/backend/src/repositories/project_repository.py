from dataclasses import dataclass

from sqlalchemy import select, delete
from sqlalchemy.orm import Session

from db.models.projects import Project


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

    def get(self, project_id: int) -> Project | None:
        return self.database.get(Project, project_id)

    def list(self) -> list[Project]:
        return list(self.database.scalars(select(Project)).all())

    def update(self, project_id: int, new: UpdateProject) -> Project | None:
        project = self.get(project_id)

        if not project:
            return None

        if new.agent_id is not None:
            project.agent_id = new.agent_id
        if new.label is not None:
            project.label = new.label
        if new.video_ids is not None:
            project.video_ids = new.video_ids

        self.database.commit()
        self.database.refresh(project)
        return project

    def delete(self, project_id: int) -> bool:
        result = self.database.execute(
            delete(Project).where(Project.id == project_id)
        )
        self.database.commit()
        return result.rowcount > 0
