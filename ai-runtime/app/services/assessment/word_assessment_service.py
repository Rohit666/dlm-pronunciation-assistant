from app.models.word_assessment import (
    WordAssessment,
)


class WordAssessmentService:

    def assess(
        self,
        recognition,
        pronunciation,
    ):

       return WordAssessment(
            word=recognition.reference.word
                if recognition.reference
                else (
                    recognition.student.word
                    if recognition.student
                    else ""
                ),
            student_word=(
                recognition.student.word
                if recognition.student
                else None
            ),
            operation=recognition.operation,
            accepted=recognition.result.accepted,
            confidence=recognition.result.confidence,
            pronunciation=pronunciation,
            accuracy=(
                pronunciation.overall_accuracy
                if pronunciation
                else 0.0
            ),
            weak_phonemes=(
                pronunciation.weak_phonemes
                if pronunciation
                else []
            ),
        )