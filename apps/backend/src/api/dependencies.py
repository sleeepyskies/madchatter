from typing import Generator, Annotated

from fastapi import Request, Depends
from sqlalchemy.orm import Session

from repositories.project_repository import ProjectRepository
from repositories.video_repository import VideoRepository
from repositories.agent_repository import AgentRepository
from services.project_service import ProjectService
from services.video_service import VideoService
from services.agent_service import AgentService
from repositories.settings_repository import SettingsRepository
from services.settings_service import SettingsService


def database(request: Request) -> Generator[Session, None, None]:
    """
    Provides a database session per request and handles auto closing the connection.

    :param request: FastAPI request object.
    :return: Database session.
    """
    db = request.app.state.SessionLocal()

    try:
        yield db
    finally:
        db.close()


DBSession = Annotated[Session, Depends(database)]


def get_video_service(db: DBSession) -> VideoService:
    """Provides access to the VideoService."""
    video_repository = VideoRepository(db)
    return VideoService(video_repository)


def get_project_service(db: DBSession) -> ProjectService:
    """Provides access to the ProjectService."""
    project_repository = ProjectRepository(db)
    video_repository = VideoRepository(db)
    return ProjectService(project_repository, video_repository)


def get_agent_service(db: DBSession) -> AgentService:
    """Provides access to the AgentService."""
    agent_repository = AgentRepository(db)
    return AgentService(agent_repository)


def get_settings_service(db: DBSession) -> SettingsService:
    """Provides access to the SettingsService."""
    settings_repository = SettingsRepository(db)
    return SettingsService(settings_repository)
