from models.agent import Language
from services.chat.chat_service import ChatService
from services.chat.rag_module import RAG
from services.chat.stt_module import SpeechToText
from services.chat.tts_module import TextToSpeech
from services.chat.video_matcher_module import VideoMatcher
from models.videos import VideoResponse

class ChatServiceFactory:
    """Factory class to create ChatService instances with the appropriate configurations"""

    @staticmethod
    def create(language: Language | None,
               chroma_collection: str | None,
               voice_model: str | None,
               system_prompt: str | None,
               videos: list[VideoResponse] | None,
               idle_video: VideoResponse | None,
               enter_video: VideoResponse | None,
               exit_video: VideoResponse | None) -> ChatService:

        stt = SpeechToText(
            model_size="small",
            language=language.value,
            device="cpu",
            compute_type="int8",
        )

        rag = RAG(chroma_collection=chroma_collection, system_prompt=system_prompt)

        if voice_model is None:
            raise Exception("Must create ChatService with valid voice_model")
        if language is None:
            raise Exception("Must create ChatService with valid language")
        if videos is None:
            raise Exception("Must create ChatService with valid videos")

        tts = TextToSpeech(voice_model=voice_model, language=language)

        video_matcher = VideoMatcher(videos=videos)

        return ChatService(
            stt_service=stt,
            rag_service=rag,
            tts_service=tts,
            video_matcher_service=video_matcher,
            idle_video=idle_video,
            enter_video=enter_video,
            exit_video=exit_video
        )