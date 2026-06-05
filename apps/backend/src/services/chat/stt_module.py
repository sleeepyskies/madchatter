from faster_whisper import  WhisperModel

class SpeechToText:
    """
    A class for performing speech-to-text transcription using the WhisperModel from the faster_whisper library.
    """
    def __init__(self, model_size="base", device="cpu", compute_type="int8"):
        """
        Initializes the SpeechToText class with the specified model size, device, and compute type.
        
        :param model_size: The size of the Whisper model to use (e.g., "tiny", "base", "small", "medium", "large").
        :param device: The device to run the model on (e.g., "cpu", "cuda").
        :param compute_type: The compute type for the model (e.g., "int8", "float16"). This can help optimize performance on certain hardware.
        """
        self.model = WhisperModel(model_size, device=device, cpu_threads=4, num_workers=2,compute_type=compute_type)

    def transcribe(self, audio_path):
        segments, info = self.model.transcribe(
            audio_path,
            beam_size=1,
            temperature=0.0,
            vad_filter=True,
            language="de")

        text_list = [segment.text for segment in segments]
        return "".join(text_list).strip()
