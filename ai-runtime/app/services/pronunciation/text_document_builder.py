import re
from app.models.pronunciation_document import (
    PronunciationDocument,
)

from app.models.word_pronunciation import (
    WordPronunciation,
)


class TextDocumentBuilder:

    def build(
        self,
        text,
        language="en",
    ):

        document = PronunciationDocument(
            language=language,
        )
        for word in text.split():
            original_word = word
            normalized_word = self.normalize_word(word)

            if normalized_word:
                document.words.append(
                    WordPronunciation(
                        word=original_word,
                        normalized=normalized_word,
                    )
                )
        return document
    def normalize_word(
        self,
        word,
    ):

        #
        # Remove surrounding whitespace.
        #
        word = word.strip()

        #
        # Remove punctuation from beginning/end.
        #
        word = word.strip(
            ".,!?;:\"()[]{}"
        )

        #
        # Normalize curly apostrophes.
        #
        word = (
            word.replace("’", "'")
        )

        #
        # Lowercase for recognition.
        #
        word = word.lower()

        return word