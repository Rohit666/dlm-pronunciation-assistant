from dataclasses import dataclass, field

from app.models.learning_need import (
    LearningNeed,
)


@dataclass
class LearningDiagnosis:
    overall_accuracy: float = 0.0
    cefr_estimate: str | None = None
    confidence: float = 0.0
    strengths: list[str] = field(
        default_factory=list
    )
    needs: list[LearningNeed] = field(
        default_factory=list
    )