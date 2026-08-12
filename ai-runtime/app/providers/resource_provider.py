from pathlib import Path
import platform
import shutil

from app.providers.provider_result import (
    ProviderValidationResult,
)


class ResourceProvider:

    BASE_DIR = Path(__file__).resolve().parent.parent.parent

    SYSTEM = platform.system()

    @classmethod
    def is_windows(cls):
        return cls.SYSTEM == "Windows"

    @classmethod
    def is_linux(cls):
        return cls.SYSTEM == "Linux"

    @classmethod
    def runtime_folder(cls):
        return cls.BASE_DIR / "runtime"

    @classmethod
    def find_system_binary(cls, executable):

        path = shutil.which(executable)

        if path:
            return Path(path)

        return None

    @classmethod
    def validate(cls):
        raise NotImplementedError