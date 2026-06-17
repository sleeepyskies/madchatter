from services.chat.chat_service import ChatService
from services.project_service import ProjectService
from services.chat.chat_service_factory import ChatServiceFactory
from services.agent_service import AgentService
from services.knowledge_service import KnowledgeService
from fastapi import UploadFile, File


class ChatApplicationService:
    """Handles chat related business logic, acting as an application service that coordinates between the chat service and other domain services."""

    def __init__(self,
                 project_service: ProjectService,
                 chat_factory: ChatServiceFactory,
                 agent_service: AgentService,
                 knowledge_service: KnowledgeService):

        self.chat_service: ChatService | None = None
        self.project_service = project_service
        self.chat_factory = chat_factory
        self.agent_service = agent_service
        self.knowledge_service = knowledge_service


    def apply_project(self, project_id: int):
        """Initializes the chat service based on the project's configuration, including the agent and knowledge base."""
        project = self.project_service.get_project(project_id)
        agent = self.agent_service.get_agent(project.agent_id)
        chroma_collection = self.knowledge_service.fetch_knowledge_base(project.knowledge_id)

        config = {
            "language": agent.language,
            "voice_model": agent.voice_model,
            "chroma_collection": chroma_collection,
        }

        self.chat_service = self.chat_factory.create(**config)

    def chat(self, file: UploadFile):
        """Main chat process"""
        if self.chat_service is None:
            raise RuntimeError("No project applied")

        return self.chat_service.chat(file)

    def get_latest_reply(self) -> str:
        """Returns the latest reply from the chat service, or an empty string if no chat service is initialized."""
        if self.chat_service is None:
            return ""

        return self.chat_service.latest_reply

    def reset(self):
        """Resets the chat service's memory, effectively clearing the conversation history."""
        if self.chat_service:
            self.chat_service.chat_memory.clear()