import os
import shutil
import time

from fastapi import UploadFile
from fastapi.responses import JSONResponse, StreamingResponse
from loguru import logger

from services.chat.rag_module import RAG
from services.chat.stt_module import SpeechToText
from services.chat.tts_module import TextToSpeech


class ChatService:
    """A service that handles the entire chat pipeline"""

    def __init__(
            self,
            stt_service: SpeechToText = None,
            rag_service: RAG = None,
            tts_service: TextToSpeech = None
    ):
        self.chat_memory = []
        self.latest_reply = ""
        self.stt_service = stt_service
        self.rag_service = rag_service
        self.tts_service = tts_service

    def chat(self, file: UploadFile):
        """Main method to handle the chat process"""

        temp_input_path = self._save_input_audio(file)

        try:
            user_text = self._transcribe_audio(temp_input_path)
            self._update_memory_user(user_text)
            return StreamingResponse(self._stream_pipeline(user_text),
                                     media_type="audio/pcm",
                                     headers={
                                         "X-User-Text":
                                             user_text.encode("utf-8").decode("latin-1")
                                     })
        except Exception as e:
            logger.error(f"Error: {e}")
            if os.path.exists(temp_input_path):
                os.remove(temp_input_path)
            return JSONResponse(status_code=500, content={"error": str(e)})

    def _save_input_audio(self, file: UploadFile) -> str:
        """Saves the user input audio file to a temporary location and returns the path"""
        current_dir = os.path.dirname(os.path.abspath(__file__))
        temp_input_path = os.path.join(current_dir, "temp_input.wav")

        with open(temp_input_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        return temp_input_path

    def _transcribe_audio(self, audio_path: str) -> str:
        """Transcribes the audio file to text using the STT service"""
        t_stt_start = time.perf_counter()
        user_text = self.stt_service.transcribe(audio_path)
        t_stt = time.perf_counter() - t_stt_start
        os.remove(audio_path)
        logger.debug(f"\n[STT]: {t_stt:.3f}s | Text: '{user_text}'")
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
        llm_stream = self.rag_service.ask_stream(user_text, self.chat_memory[:-1])
        text_stream = self._chunk_text(llm_stream)
        audio_stream = self.tts_service.speak_stream(text_stream)
        yield from self._fix_pcm_stream(audio_stream)

    def _chunk_text(self, stream):
        """Buffers the streaming text output and yields it in chunks based on punctuation or length for more natural TTS processing."""
        buffer = ""
        full_reply = ""
        punctuations = ('.', '?', '!', ',', ';', '。', '？', '！', '，', '；', '\n')

        for text_chunk in stream:
            full_reply += text_chunk
            buffer += text_chunk

            if any(p in buffer for p in punctuations) or len(buffer) >= 80:
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
