from services.chat.chat_service import ChatService
from services.project.project_service import ProjectService
from services.video_service import VideoService
from services.chat.chat_service_factory import ChatServiceFactory
from services.agent_service import AgentService
from services.knowledge_service import KnowledgeService
from fastapi import UploadFile
from fastapi.responses import StreamingResponse
from models.chat import VideoPreloadResponse, ChatModeResponse, LatestReplyResponse, ApplyProjectResponse


class ChatApplicationService:
    """Handles chat related business logic, acting as an application service that coordinates between the chat service and other domain services."""

    def __init__(self,
                 project_service: ProjectService,
                 chat_factory: ChatServiceFactory,
                 agent_service: AgentService,
                 video_service: VideoService,
                 knowledge_service: KnowledgeService):

        self.chat_service: ChatService | None = None
        self.project_service = project_service
        self.video_service = video_service
        self.chat_factory = chat_factory
        self.agent_service = agent_service
        self.knowledge_service = knowledge_service

    def apply_project(self, project_id: int) -> ApplyProjectResponse:
        """Initializes the chat service based on the project's configuration, including the agent and knowledge base."""
        project = self.project_service.get_project(project_id)
        agent = project.agent
        videos = self.video_service.list_videos_for_project(project_id)
        idle_video = project.idle_video
        enter_video = project.enter_video
        exit_video = project.exit_video


        chroma_collection = self.knowledge_service.fetch_knowledge_base(project.knowledge_id)

        config = {
            "language": agent.language,
            "voice_model": agent.voice_model,
            "chroma_collection": chroma_collection,
            "system_prompt": agent.system_prompt,
            "videos": videos,
            "idle_video": idle_video,
            "enter_video": enter_video,
            "exit_video": exit_video
        }

        self.chat_service = self.chat_factory.create(**config)

        return ApplyProjectResponse(
            project_id=project_id
        )

    def get_chat_mode(self, file: UploadFile) -> ChatModeResponse:
        """
        Get chat mode for each session.
        Includes: video_only, video_and_tts, only_tts
        """
        if self.chat_service is None:
            raise RuntimeError("No project applied")

        return self.chat_service.analyze_mode(file)

    def stream_chat(self, user_text: str) -> StreamingResponse:
        """Stream chat process: LLM + TTS"""
        if self.chat_service is None:
            raise RuntimeError("No project applied")

        return self.chat_service.stream_chat(user_text)

    def exit_chat(self) -> ChatModeResponse:
        """Exit the current chat session"""
        if self.chat_service is None:
            raise RuntimeError("No project applied")

        return self.chat_service.exit_chat()

    def get_latest_reply(self) -> LatestReplyResponse:
        """Return the latest reply from the chat service."""
        if self.chat_service is None:
            raise RuntimeError("No project applied")

        return LatestReplyResponse(
            reply=self.chat_service.latest_reply
        )

    def get_all_videos(self) -> VideoPreloadResponse:
        """Return all videos for preload"""
        if not self.chat_service:
            raise RuntimeError("No project applied")

        return VideoPreloadResponse(
            idle_video=self.chat_service.idle_video,
            enter_video=self.chat_service.enter_video,
            exit_video=self.chat_service.exit_video,
            videos=self.chat_service.video_matcher_service.videos
        )