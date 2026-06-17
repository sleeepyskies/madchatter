from typing import Generator, Annotated

from fastapi import Request, Depends
from sqlalchemy.orm import Session

from repositories.agent_repository import AgentRepository
from repositories.knowledge_source_repository import KnowledgeSourceRepository
from repositories.project_repository import ProjectRepository
from repositories.vector_collection_repository import VectorCollectionRepository
from repositories.video_repository import VideoRepository
from services.agent_service import AgentService
from services.knowledge_service import KnowledgeService
from services.project_service import ProjectService
from services.video_service import VideoService
from services.chat.chat_service_factory import ChatServiceFactory
from services.chat.chat_application_service import ChatApplicationService


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

chat_application_service = None


def get_knowledge_service(db: DBSession) -> KnowledgeService:
    """Provides access to the KnowledgeService."""
    knowledge_source_repository = KnowledgeSourceRepository(db)
    vector_collection_repository = VectorCollectionRepository(db)
    return KnowledgeService(knowledge_source_repository, vector_collection_repository)


def get_video_service(db: DBSession) -> VideoService:
    """Provides access to the VideoService."""
    video_repository = VideoRepository(db)
    return VideoService(video_repository)


def get_project_service(db: DBSession) -> ProjectService:
    """Provides access to the ProjectService."""
    project_repository = ProjectRepository(db)
    video_repository = VideoRepository(db)
    agent_service = get_agent_service(db)
    knowledge_service = get_knowledge_service(db)
    return ProjectService(project_repository, video_repository, agent_service, knowledge_service)


def get_agent_service(db: DBSession) -> AgentService:
    """Provides access to the AgentService."""
    agent_repository = AgentRepository(db)
    return AgentService(agent_repository)

def get_chat_application_service(db: DBSession) -> ChatApplicationService:
    """Provides access to the ChatApplicationService, ensuring a single instance is used across the application."""
    global chat_application_service

    if chat_application_service is None:

        chat_application_service = ChatApplicationService(
            project_service=get_project_service(db),
            chat_factory=ChatServiceFactory(),
            agent_service=get_agent_service(db),
            knowledge_service=get_knowledge_service(db),
        )

    return chat_application_service