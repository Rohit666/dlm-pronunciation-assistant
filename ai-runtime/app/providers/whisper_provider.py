from pathlib import Path

from app.providers.resource_provider import ResourceProvider
from app.core.config import DEFAULT_WHISPER_MODEL
from app.providers.provider_result import (
    ProviderValidationResult,
)

class WhisperProvider(ResourceProvider):

    @classmethod
    def binary(cls):

        if cls.is_windows():

            return (
                cls.runtime_folder()
                / "whisper"
                / "windows"
                / "whisper-cli.exe"
            )

        return (
            cls.runtime_folder()
            / "whisper"
            / "linux"
            / "whisper-cli"
        )

    @classmethod
    def model(cls):

        if cls.is_windows():

            return (
                cls.runtime_folder()
                / "whisper"
                / "windows"
                / DEFAULT_WHISPER_MODEL
            )

        return (
            cls.runtime_folder()
            / "whisper"
            / "linux"
            / DEFAULT_WHISPER_MODEL
        )

    @classmethod
    def source(cls):

        return "bundled"
    @classmethod
    def validate(cls):
        binary = cls.binary()
        model = cls.model()
        return ProviderValidationResult(
        available=binary.exists() and model.exists(),
        source="bundled",
        path=str(binary),
        version=None,
        message=None
        if binary.exists()
        else "Whisper binary not found.",
    )