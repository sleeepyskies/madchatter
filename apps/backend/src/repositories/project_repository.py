from sqlalchemy import select, delete, update
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
        values = new.model_dump(exclude_unset=True)

        if not values:
            return self.get(project_id)

        statement = (
            update(Project)
            .where(Project.id == project_id)
            .values(**values)
            .returning(Project)
        )

        project = self.database.scalar(statement)

        if not project:
            self._raise_not_found(project_id)

        self.database.commit()
        return project

    def delete(self, project_id: int) -> None:
        statement = delete(Project).where(Project.id == project_id)
        result = self.database.execute(statement)

        if result.rowcount == 0:
            self._raise_not_found(project_id)

        self.database.commit()
