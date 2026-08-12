from dataclasses import dataclass, field

from app.models.word_pronunciation import (
    WordPronunciation,
)


@dataclass
class PronunciationDocument:

    language: str = "en"

    words: list[
        WordPronunciation
    ] = field(
        default_factory=list
    )
    
    def flatten(
        self,
    ):
        phonemes = []
        for index, word in enumerate(
            self.words
        ):
            for phoneme in word.phonemes:
                phoneme.word_index = index
                phonemes.append(
                    phoneme
                )
        return phonemes