import os
import shutil

from fastapi import UploadFile, File
from fastapi.responses import StreamingResponse, FileResponse
from loguru import logger

from services.chat.rag_module import RAG
from services.chat.stt_module import SpeechToText
from services.chat.tts_module import TextToSpeech
from services.chat.video_matcher_module import VideoMatcher
from models.chat import ChatModeResponse, Mode
from models.videos import VideoResponse

class ChatService:
    """
    The entire chat pipeline.
    STT -> mode selection -> video matching -> LLM (RAG) -> TTS streaming.

    Includes:
    - conversation state (IDLE / CHAT)
    - short-term chat memory
    - latest assistant reply for frontend retrieval
    """

    def __init__(self, stt_service: SpeechToText = None,
                 rag_service: RAG = None,
                 tts_service: TextToSpeech = None,
                 video_matcher_service: VideoMatcher = None,
                 idle_video: VideoResponse = None,
                 enter_video: VideoResponse = None,
                 exit_video: VideoResponse = None):

        self.state = "IDLE"
        self.chat_memory = []
        self.latest_reply = ""
        self.stt_service = stt_service
        self.rag_service = rag_service
        self.tts_service = tts_service
        self.video_matcher_service = video_matcher_service
        self.idle_video = idle_video
        self.enter_video = enter_video
        self.exit_video = exit_video

    def analyze_mode(self, file: UploadFile) -> ChatModeResponse:
        """
        Step 1 of pipeline:
        - STT
        - Determine interaction state (IDLE → CHAT)
        - Select response mode (video / tts / both)

        This does NOT trigger LLM or TTS streaming.
        """
        temp_input_path = self._save_input_audio(file)

        try:
            user_text = self._transcribe_audio(temp_input_path)

            # First enter interaction, transition from IDLE to CHAT
            if self.state == "IDLE":
                self.state = "CHAT"

                if self.enter_video is not None:
                    return self._handle_enter_interaction(user_text)

            # normal CHAT State
            return self._handle_chat(user_text)

        finally:
            if temp_input_path and os.path.exists(temp_input_path):
                os.remove(temp_input_path)

    def stream_chat(self, user_text: str) -> StreamingResponse:
        """
        Step 2 of pipeline:
        LLM -> streaming text -> TTS -> audio stream output
        """
        self._update_memory_user(user_text)
        return StreamingResponse(
            self._stream_pipeline(user_text),
            media_type="audio/pcm"
        )

    def exit_chat(self) -> ChatModeResponse:
        """
        Exit session:
        - reset state to IDLE
        - clear memory
        - return exit video if configured
        """
        self.state = "IDLE"
        self._reset_session()

        return ChatModeResponse(
            mode=Mode.video_only,
            video_id=self.exit_video.id if self.exit_video else None
        )

    def _handle_enter_interaction(self, user_text) -> ChatModeResponse:
        """
        Handle first interaction in a session, return enter welcome video.
        """
        video = self.enter_video

        if video:
            return ChatModeResponse(
                mode=Mode.video_and_tts,
                video_id=video.id,
                user_text=user_text
            )

        return ChatModeResponse(
            mode=Mode.tts_only,
            user_text=user_text
        )

    def _handle_chat(self, user_text: str) -> ChatModeResponse:
        """
        Normal chat mode:
        - match video by user text.
        - decide response mode.
        """

        # Match customized videos
        video = self.video_matcher_service.match_video(user_text)

        if video:
            if video.includes_audio:
                return ChatModeResponse(mode=Mode.video_only,
                                        video_id=video.id,
                                        user_text=user_text)
            return ChatModeResponse(mode=Mode.video_and_tts,
                                    video_id=video.id,
                                    user_text=user_text)
        return ChatModeResponse(mode=Mode.tts_only,
                                user_text=user_text)


    def _reset_session(self):
        """Reset session, clear chat history."""
        self.chat_memory.clear()
        self.latest_reply = ""

    def _save_input_audio(self, file: UploadFile) -> str:
        """Saves the user input audio file to a temporary location and returns the path"""
        current_dir = os.path.dirname(os.path.abspath(__file__))
        temp_input_path = os.path.join(current_dir, "temp_input.wav")

        with open(temp_input_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        return temp_input_path

    def _transcribe_audio(self, audio_path: str) -> str:
        """Transcribes the audio file to text using the STT service"""
        user_text = self.stt_service.transcribe(audio_path)
        logger.debug(f"\n[STT] Text: '{user_text}'")
        return user_text

    def _update_memory_user(self, user_text: str):
        """Updates the chat memory with the user's input text"""
        self.chat_memory.append({"role": "user", "content": user_text})
        if len(self.chat_memory) > 20:
            self.chat_memory = self.chat_memory[-20:]

    def _update_memory_assistant(self, reply: str):
        """Updates the chat memory with the assistant's reply and stores the latest reply for retrieval"""
        self.latest_reply = reply
        self.chat_memory.append({"role": "assistant", "content": reply})

    def _stream_pipeline(self, user_text: str):
        """Streams the response from the RAG service, processes it in chunks, and yields audio bytes from the TTS service"""
        try:
            llm_stream = self.rag_service.ask_stream(user_text, self.chat_memory[:-1])
            text_stream = self._chunk_text(llm_stream)
            audio_stream = self.tts_service.speak_stream(text_stream)
            yield from self._fix_pcm_stream(audio_stream)

        except Exception as e:
            logger.exception(e)
            return


    def _chunk_text(self, stream):
        """Buffers the streaming text output and yields it in chunks based on punctuation or length for more natural TTS processing."""
        buffer = ""
        full_reply = ""
        punctuations = ('.', '?', '!', ';', '。', '？', '！', '，', '；', '\n')

        for text_chunk in stream:
            full_reply += text_chunk
            buffer += text_chunk

            if any(p in buffer for p in punctuations) or len(buffer) >= 150:
                yield buffer
                buffer = ""

        if buffer.strip():
            yield buffer

        logger.debug(f"[LLM]: {full_reply}")
        self._update_memory_assistant(full_reply)

    def _fix_pcm_stream(self, audio_stream):
        """Ensures that the streamed audio bytes from the TTS service are properly aligned for PCM format (16-bit samples), handling any odd byte issues."""
        leftover = b""

        for audio_bytes in audio_stream:
            if leftover:
                audio_bytes = leftover + audio_bytes
                leftover = b""

            if len(audio_bytes) % 2 != 0:
                leftover = audio_bytes[-1:]
                audio_bytes = audio_bytes[:-1]

            if audio_bytes:
                yield audio_bytes


