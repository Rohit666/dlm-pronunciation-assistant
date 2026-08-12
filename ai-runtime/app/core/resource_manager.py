import json
from pathlib import Path
from app.core.pronunciation_resources import (
    PronunciationResources,
)
from app.core.recognition_resources import (
    RecognitionResources,
)
class ResourceManager:

    BASE_DIR = Path(__file__).resolve().parent.parent

    RESOURCE_DIR = BASE_DIR / "resources"
    _cache = {}
    LANGUAGE_MAP = {
        "en": "en",
        "hi": "hindi",
        "ml": "malayalam",
        "ta": "tamil",
        "ar": "arabic",
    }

    @classmethod
    def language_folder(cls, language: str):

        return cls.LANGUAGE_MAP.get(
            language,
            "en",
        )

    @classmethod
    def pronunciation_folder(cls, language="en"):

        return (
            cls.RESOURCE_DIR
            / "pronunciation"
            / cls.language_folder(language)
        )
    @classmethod
    def pronunciation(
        cls,
        language="en",
    ):
        return PronunciationResources(
            cls.RESOURCE_DIR,
            language,
        )
    @classmethod
    def recognition(
        cls,
    ):
        return RecognitionResources(
            cls.RESOURCE_DIR,
        )