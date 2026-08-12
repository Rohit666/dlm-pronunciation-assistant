from dataclasses import dataclass, field

from app.models.word_feedback import (
    WordFeedback,
)


@dataclass
class FeedbackDocument:

    words: list[
        WordFeedback
    ] = field(
        default_factory=list
    )