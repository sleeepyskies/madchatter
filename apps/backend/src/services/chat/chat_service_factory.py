from services.chat.chat_service import ChatService
from services.chat.rag_module import RAG
from services.chat.stt_module import SpeechToText
from services.chat.tts_module import TextToSpeech
from services.chat.video_matcher_module import VideoMatcher
from models.videos import VideoResponse

class ChatServiceFactory:
    """Factory class to create ChatService instances with the appropriate configurations"""

    @staticmethod
    def create(language: str, chroma_collection: str | None,
               voice_model: str, system_prompt: str | None,
               videos: list[VideoResponse],
               idle_video: VideoResponse,
               enter_video: VideoResponse,
               exit_video: VideoResponse) -> ChatService:

        stt = SpeechToText(
            model_size="base",
            language=language,
            device="cpu",
            compute_type="int8"
        )

        rag = RAG(chroma_collection=chroma_collection, system_prompt=system_prompt)

        tts = TextToSpeech(voice_model=voice_model)

        video_matcher = VideoMatcher(videos=videos, idle_video=idle_video)

        return ChatService(
            stt_service=stt,
            rag_service=rag,
            tts_service=tts,
            video_matcher_service=video_matcher
        )