import subprocess
import time
from pathlib import Path

from app.core.runtime_manager import RuntimeManager
from app.core.config import VERSION
from app.utils.process_runner import ProcessRunner
from app.core.audio_preprocessor import AudioPreprocessor
from app.models.transcription_result import (TranscriptionResult)
from app.models.runtime_metadata import (RuntimeMetadata)
from app.services.speech.transcript_normalizer import (TranscriptNormalizer)
from app.services.speech.speech_detector import (SpeechDetector, SpeechDetectionResult) 
class WhisperService:

    def __init__(self):
        runtime = RuntimeManager.whisper_provider()
        if not runtime.available:
            raise RuntimeError(runtime.message)

        self.binary = RuntimeManager.whisper_binary()
        self.model = RuntimeManager.whisper_model()
        self.preprocessor = AudioPreprocessor(
            ffmpeg_binary=str(RuntimeManager.ffmpeg_binary())
        )    
        self.speech_detector = SpeechDetector()
        self.speech_detection_enabled = True
        
    def transcribe(self, audio_path: str, language: str = "en"):

        start = time.perf_counter()

        audio_file = Path(audio_path)

        if not audio_file.exists():
            raise FileNotFoundError(
                f"Audio file not found: {audio_file}"
            )

        temporary_wav = None

        try:

            if audio_file.suffix.lower() != ".wav":
                temporary_wav = self.preprocessor.convert_to_wav(
                    str(audio_file)
                )
                
            audio_file = Path(temporary_wav)
            detection = self.speech_detector.detect(
                wav_path=str(audio_file)
            )
            print("========== TEMPORARY WAV ==========")
            print("Path:", temporary_wav)
            print("================================")
            if self.speech_detection_enabled and not detection.has_speech:
                return TranscriptionResult(
                    transcript="",
                    language=language,
                    metadata=RuntimeMetadata(
                        engine="whisper.cpp",
                        model=self.model.name,
                        processing_time=round(
                            time.perf_counter() - start,
                            3,
                        ),
                        runtime_version=VERSION,
                    ),
                )
            
            command = [
                str(self.binary),
                "--model",
                str(self.model),
                "--file",
                str(audio_file),
                "--language",
                language,
                "--no-timestamps",
            ]
            transcript = ProcessRunner.run(command)
            transcript = TranscriptNormalizer.normalize(transcript)
            print("========== TRANSCRIPT ==========")
            print(repr(transcript))
            print("Length:", len(transcript))
            print("================================")
           
            return TranscriptionResult(
                transcript=transcript,
                language=language,
                metadata=RuntimeMetadata(

                    engine="whisper.cpp",

                    model=self.model.name,

                    processing_time=round(
                        time.perf_counter() - start,
                        3,
                    ),
                    runtime_version=VERSION,
                ),

            )

        except subprocess.CalledProcessError as error:

            raise RuntimeError(
                error.stderr if error.stderr else str(error)
            )
        finally:
            if temporary_wav:
                try:
                    Path(temporary_wav).unlink(missing_ok=True)
                except Exception:
                    pass