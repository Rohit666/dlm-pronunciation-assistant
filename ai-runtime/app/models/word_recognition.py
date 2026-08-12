from dataclasses import dataclass

from app.models.word_pronunciation import (
    WordPronunciation,
)

from app.models.alignment_operation import (
    AlignmentOperation,
)

from app.models.word_recognition_result import (
    WordRecognitionResult,
)


@dataclass
class WordRecognition:
    index: int = 0
    reference: WordPronunciation | None = None
    student: WordPronunciation | None = None
    operation: AlignmentOperation | None = None
    result: WordRecognitionResult | None = None
    assessed: bool = False