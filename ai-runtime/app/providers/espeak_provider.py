from pathlib import Path

from app.providers.resource_provider import ResourceProvider
from app.providers.provider_result import (
    ProviderValidationResult,
)


class ESpeakProvider(ResourceProvider):

    @classmethod
    def binary(cls):

        if cls.is_windows():

            bundled = (
                cls.runtime_folder()
                / "espeak"
                / "windows"
                / "espeak.exe"
            )

        else:

            bundled = (
                cls.runtime_folder()
                / "espeak"
                / "linux"
                / "espeak-ng"
            )

        if bundled.exists():
            return bundled

        executable = "espeak" if cls.is_windows() else "espeak-ng"

        system = cls.find_system_binary(executable)

        if system:
            return system

        return bundled

    @classmethod
    def source(cls):

        if cls.binary().exists():

            bundled = (
                cls.runtime_folder()
                / "espeak"
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
            else "eSpeak executable not found.",
        )