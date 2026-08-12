from dataclasses import dataclass, field


@dataclass
class WordFeedback:

    word: str
    accuracy: float
    weak_phonemes: list[str] = field(
        default_factory=list
    )
    messages: list[str] = field(
        default_factory=list
    )
    practice_words: list[str] = field(
        default_factory=list
    )
    animation: str | None = None