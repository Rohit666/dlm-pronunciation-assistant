from dataclasses import dataclass
from pathlib import Path

import soundfile as sf
import torch

from app.services.speech.vad_utils import (
    OnnxWrapper,
    get_speech_timestamps,
)


@dataclass
class SpeechDetectionResult:

    has_speech: bool
    speech_segments: int
    speech_duration: float


class SpeechDetector:

    def __init__(self):

        model_path = (
            Path(__file__).parent
            / "models"
            / "silero_vad.onnx"
        )

        self.model = OnnxWrapper(
            str(model_path),
            force_onnx_cpu=True,
        )

    def detect(
        self,
        wav_path: str,
    ) -> SpeechDetectionResult:

        #
        # Read WAV using SoundFile
        #
        audio, sample_rate = sf.read(
            wav_path,
            dtype="float32",
        )
        if sample_rate != 16000:
            raise ValueError(
            f"Expected 16000 Hz audio, got {sample_rate} Hz."
        )
        #
        # Stereo → Mono
        #
        if len(audio.shape) > 1:
            audio = audio.mean(axis=1)

        #
        # Convert to Tensor
        #
        audio = torch.from_numpy(audio)

        #
        # Run Silero
        #
        speech = get_speech_timestamps(
            audio,
            self.model,
            sampling_rate=sample_rate,
            return_seconds=True,
        )

        duration = sum(
            segment["end"] - segment["start"]
            for segment in speech
        )

        return SpeechDetectionResult(
            has_speech=len(speech) > 0,
            speech_segments=len(speech),
            speech_duration=round(duration, 2),
        )