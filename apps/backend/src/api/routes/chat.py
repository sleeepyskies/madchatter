from fastapi import APIRouter, Depends, FastAPI, UploadFile, File
from loguru import logger

from services.chat.rag_module import RAG
from services.chat.stt_module import SpeechToText
from services.chat.tts_module import TextToSpeech
import os
import shutil
import time
from fastapi.responses import JSONResponse, StreamingResponse, FileResponse


CHAT_PREFIX = "/chat"

router = APIRouter(prefix=CHAT_PREFIX, tags=["chat"])

stt_service = SpeechToText(model_size="base", device="cpu", compute_type="int8")
rag_service = RAG()
tts_service = TextToSpeech()

chat_memory = []
latest_reply = ""

@router.post("")
def chat(file: UploadFile = File(...)):
    global chat_memory, latest_reply
    latest_reply = ""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    temp_input_path = os.path.join(current_dir, "temp_input.wav")

    with open(temp_input_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        # 1. (STT)
        t_stt_start = time.perf_counter()
        user_text = stt_service.transcribe(temp_input_path)
        t_stt = time.perf_counter() - t_stt_start
        os.remove(temp_input_path)

        logger.debug(f"\n[STT]: {t_stt:.3f}s | Text: '{user_text}'")

        chat_memory.append({"role": "user", "content": user_text})
        if len(chat_memory) > 20:
            chat_memory = chat_memory[-20:]

        def stream_pipeline_wrapper():
            llm_text_generator = rag_service.ask_stream(user_text, chat_memory[:-1])

            def track_and_buffer_llm(text_stream):
                global latest_reply
                full_reply = ""
                for text_chunk in text_stream:
                    full_reply += text_chunk
                    yield text_chunk

                logger.debug(f"[LLM]: {full_reply}")
                latest_reply = full_reply
                chat_memory.append({"role": "assistant", "content": full_reply})

            tracked_text_stream = track_and_buffer_llm(llm_text_generator)

            def chunk_text_by_punctuation(text_stream):
                buffer = ""
                punctuations = ('.', '?', '!', ',', ';', '。', '？', '！', '，', '；', '\n')

                for text_chunk in text_stream:
                    buffer += text_chunk
                    if any(p in buffer for p in punctuations) or len(buffer) >= 80:
                        yield buffer
                        buffer = ""
                if buffer.strip():
                    yield buffer

            buffered_text_stream = chunk_text_by_punctuation(tracked_text_stream)

            audio_stream = tts_service.speak_stream(buffered_text_stream)

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

        #
        return StreamingResponse(
            stream_pipeline_wrapper(),
            media_type="audio/pcm",
            headers={"X-User-Text": user_text.encode('utf-8').decode('latin-1')}
        )

    except Exception as e:
        logger.error("Error：", e)
        if os.path.exists(temp_input_path):
            os.remove(temp_input_path)
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.get("/latest_reply")
def get_latest_reply():
    global latest_reply
    return {"reply": latest_reply}