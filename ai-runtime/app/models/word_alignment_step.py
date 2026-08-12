from dataclasses import dataclass

from app.models.alignment_operation import (
    AlignmentOperation,
)

from app.models.word_pronunciation import (
    WordPronunciation,
)


@dataclass
class WordAlignmentStep:

    reference: WordPronunciation | None = None

    student: WordPronunciation | None = None

    operation: AlignmentOperation = (
        AlignmentOperation.EXACT_MATCH
    )

    similarity: float = 0.0