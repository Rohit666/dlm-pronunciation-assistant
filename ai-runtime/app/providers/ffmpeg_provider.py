from pathlib import Path

from app.providers.resource_provider import ResourceProvider
from app.providers.provider_result import (
    ProviderValidationResult,
)


class FFmpegProvider(ResourceProvider):

    @classmethod
    def binary(cls):

        if cls.is_windows():

            bundled = (
                cls.runtime_folder()
                / "ffmpeg"
                / "windows"
                / "ffmpeg.exe"
            )

        else:

            bundled = (
                cls.runtime_folder()
                / "ffmpeg"
                / "linux"
                / "ffmpeg"
            )

        if bundled.exists():
            return bundled

        system = cls.find_system_binary("ffmpeg")

        if system:
            return system

        return bundled

    @classmethod
    def source(cls):

        if cls.binary().exists():

            bundled = (
                cls.runtime_folder()
                / "ffmpeg"
                / ("windows" if cls.is_windows() else "linux")
            )

            if str(cls.binary()).startswith(str(bundled)):
                return "bundled"

            return "system"

        return "missing"
    @classmethod
    def validate(cls):

        binary = cls.binary()

        return ProviderValidationResult(
            available=binary.exists(),
            source=cls.source(),
            path=str(binary),
            version=None,
            message=None
            if binary.exists()
            else "FFmpeg executable not found.",

        )