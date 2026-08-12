from dataclasses import dataclass, field

from app.models.phoneme_token import (
    PhonemeToken,
)


@dataclass
class WordPronunciation:
    
    word: str
    normalized: str = ""
    phonemes: list[PhonemeToken] = field(
        default_factory=list
    )
    enriched: bool = False