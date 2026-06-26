import os

from loguru import logger
from piper import PiperVoice
from pathlib import Path

from models.agent import Language
from settings import Settings, settings


class TextToSpeech:
    """
    A TextToSpeech class that uses the Piper TTS engine to convert text to speech. It loads a specified TTS model and provides a method to stream synthesized audio for given text input.
    """
    def __init__(self, voice_model="eva.onnx", language: Language = Language.DE):
        self.voice_model_directory = settings.static_dir / "voice-models" / language.value
        self.model_path = str(self.voice_model_directory / voice_model)
        self.model_path = self.voice_model_directory / f"{voice_model}.onnx"
        config_path = self.voice_model_directory / f"{voice_model}.onnx.json"
        if not os.path.exists(self.model_path):
            logger.error(f"Error: Path doesn't exist {self.model_path}")

        self.voice = PiperVoice.load(self.model_path, config_path=config_path)

    def speak_stream(self, text_generator):
        logger.debug("--- TTS STREAM START ---")
        try:
            for text_chunk in text_generator:
                if not text_chunk.strip():
                    continue

                for chunk in self.voice.synthesize(text_chunk):
                    yield chunk.audio_int16_bytes
        except Exception as e:
            logger.error(f"Error during TTS streaming: {e}")
