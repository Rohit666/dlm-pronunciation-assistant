from dataclasses import dataclass

from app.models.runtime_metadata import (
    RuntimeMetadata,
)


@dataclass
class TranscriptionResult:

    transcript: str
    language: str
    metadata: RuntimeMetadata