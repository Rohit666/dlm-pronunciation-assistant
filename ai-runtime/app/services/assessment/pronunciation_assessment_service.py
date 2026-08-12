from app.engines.pronunciation.positional_phoneme_comparison_engine import (
    PositionalPhonemeComparisonEngine,
)
from app.engines.pronunciation.pronunciation_assessment_engine import (
    PronunciationAssessmentEngine,
)
from app.models.pronunciation_assessment import(
    PronunciationAssessment
)
from app.services.pronunciation.phoneme_comparison import (
    PhonemeComparisonResult,
)
from app.models.alignment_operation import (
    AlignmentOperation,
)

class PronunciationAssessmentService:

    def __init__(
        self,
        language="en",
    ):

        self.comparison_engine = (
            PositionalPhonemeComparisonEngine()
        )
        self.assessment_engine = (
            PronunciationAssessmentEngine()
        )
    def assess(
    self,
    reference,
    student,
    ):

        comparison = (
            self.comparison_engine.compare(
                reference,
                student,
            )
        )

        return self.assessment_engine.assess(
            comparison
        )
    def assess_word(
    self,
    recognition,
    ):

        if recognition.reference is None:
            return PronunciationAssessment()

        reference_phonemes = (
            recognition.reference.phonemes
        )

        student_phonemes = (
            recognition.student.phonemes
            if recognition.student
            else []
        )

        return self.assess(
            reference_phonemes,
            student_phonemes,
        )
    def aggregate(
    self,
    pronunciations,
):

        return self.assessment_engine.aggregate(
            pronunciations
        )