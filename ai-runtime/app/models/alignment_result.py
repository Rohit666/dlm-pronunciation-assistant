from dataclasses import dataclass, field

from app.models.alignment_step import (
    AlignmentStep,
)


@dataclass
class AlignmentResult:

    score: float = 0.0

    steps: list[AlignmentStep] = field(
        default_factory=list
    )