from dataclasses import dataclass, field
from app.services.pronunciation.phoneme_comparison import (
    PhonemeComparisonResult,
)



@dataclass
class PronunciationAssessment:
    overall_accuracy: float = 0
    total_reference: int = 0
    exact_matches: int = 0
    substitutions: int = 0
    insertions: int = 0
    deletions: int = 0
    weak_phonemes: list[str] = field(
        default_factory=list
    )
    phoneme_comparison: PhonemeComparisonResult | None = None