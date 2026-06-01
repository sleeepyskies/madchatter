import os
from piper import PiperVoice
from pathlib import Path

class TextToSpeech:
    """
    A TextToSpeech class that uses the Piper TTS engine to convert text to speech. It loads a specified TTS model and provides a method to stream synthesized audio for given text input.
    """
    def __init__(self, model_name="de_DE-eva_k-x_low.onnx"):

        self.backend_root = Path(__file__).resolve().parents[3]
        self.static_dir = self.backend_root / "static"
        self.model_path = str(self.static_dir / model_name)
        config_path = self.model_path + ".json"
        if not os.path.exists(self.model_path):
            print(f"Error: Path doesn't exist {self.model_path}")

        self.voice = PiperVoice.load(self.model_path, config_path=config_path)

    def speak_stream(self, text_generator):

        print("--- TTS STREAM START ---")
        try:
            for text_chunk in text_generator:
                if not text_chunk.strip():
                    continue

                for chunk in self.voice.synthesize(text_chunk):
                    yield chunk.audio_int16_bytes
        except Exception as e:
            print(f"Error during TTS streaming: {e}")
