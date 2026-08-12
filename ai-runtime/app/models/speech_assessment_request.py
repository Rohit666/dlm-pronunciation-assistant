from dataclasses import dataclass

from app.models.pronunciation_document import (
    PronunciationDocument,
)

from app.models.phoneme_token import (
    PhonemeToken,
)


@dataclass
class SpeechAssessmentRequest:

    language: str
    reference: PronunciationDocument