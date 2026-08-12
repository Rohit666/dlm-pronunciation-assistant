from dataclasses import dataclass, field

from app.models.word_alignment_step import (
    WordAlignmentStep,
)


@dataclass
class WordAlignmentResult:

    score: float = 0.0

    steps: list[
        WordAlignmentStep
    ] = field(
        default_factory=list
    )