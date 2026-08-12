from dataclasses import dataclass, field

from app.models.alignment_operation import (
    AlignmentOperation,
)

from app.models.pronunciation_assessment import (
    PronunciationAssessment,
)

@dataclass
class WordAssessment:

    #
    # Word Recognition
    #
    word: str
    student_word: str | None = None
    operation: AlignmentOperation | None = None
    accepted: bool = False
    confidence: float = 0.0
    pronunciation: PronunciationAssessment | None = None
    accuracy: float = 0.0
    weak_phonemes: list[str] = field(
        default_factory=list
    )