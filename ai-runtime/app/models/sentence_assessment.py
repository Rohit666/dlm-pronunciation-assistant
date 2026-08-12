from dataclasses import dataclass, field

from app.models.word_assessment import (
    WordAssessment,
)


@dataclass
class SentenceAssessment:
    sentence: str
    accuracy: float = 0.0
    total_words: int = 0
    weak_words: list[str] = field(
        default_factory=list
    )
    words: list[
        WordAssessment
    ] = field(
        default_factory=list
    )