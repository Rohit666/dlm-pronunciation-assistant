from app.services.pronunciation.phoneme_service import (
    PhonemeService,
)

class PronunciationEnricher:

    def __init__(self):
        self.phoneme = PhonemeService()
    def enrich(
        self,
        word,
    ):
        if word.enriched:
            return word
        ipa = self.phoneme.text_to_ipa(
            word.word
        )
        word.phonemes = (
            self.phoneme.tokenize(
                ipa
            )
        )
        word.enriched = True
        return word