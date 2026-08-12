from dataclasses import dataclass, field

from app.models.pronunciation_assessment import (
    PronunciationAssessment,
)

from app.models.word_assessment import (
    WordAssessment,
)

from app.models.sentence_assessment import (
    SentenceAssessment,
)


@dataclass
class PronunciationAssessmentDocument:

    pronunciation: PronunciationAssessment = field(
    default_factory=PronunciationAssessment
)
    words: list[
        WordAssessment
    ] = field(
        default_factory=list
    )

    sentences: list[
        SentenceAssessment
    ] = field(
        default_factory=list
    )