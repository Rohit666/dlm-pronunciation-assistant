from app.models.pronunciation_document import (
    PronunciationDocument,
)

from app.models.word_pronunciation import (
    WordPronunciation,
)

from app.services.pronunciation.phoneme_service import (
    PhonemeService,
)


class ReferencePronunciationBuilder:

    def __init__(self):

        self.phoneme = PhonemeService()

    def build(
        self,
        text,
        language="en",
    ):

        document = PronunciationDocument(
            language=language,
        )

        sentence_ipa = (
            self.phoneme.text_to_ipa(
                text
            )
        )

        # ipa_words = sentence_ipa.split()
        ipa_words = self.phoneme.split_words(
            sentence_ipa
        )

        text_words = text.split()

        if len(text_words) != len(ipa_words):

            raise ValueError(

                "Mismatch between text words and IPA words."

            )

        for word, ipa in zip(
            text_words,
            ipa_words,
        ):

            document.words.append(

                WordPronunciation(

                    word=word,

                    phonemes=self.phoneme.tokenize(
                        ipa
                    ),

                )

            )

        return document