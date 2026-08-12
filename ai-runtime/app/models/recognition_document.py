from dataclasses import dataclass, field

from app.models.word_recognition import (
    WordRecognition,
)
from app.models.pronunciation_document import(
    PronunciationDocument
)
from app.models.recognition_status import (
    RecognitionStatus
)
@dataclass
class RecognitionDocument:
    reference_document: PronunciationDocument | None = None
    student_document: PronunciationDocument | None = None
    words: list[
        WordRecognition
    ] = field(
        default_factory=list
    )
    status:RecognitionStatus | None = None
    recognized_words: int = 0
    