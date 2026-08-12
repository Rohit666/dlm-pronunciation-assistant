
from app.models.sentence_assessment import (
    SentenceAssessment,
)

class SentenceAssessmentService:

    def assess(
        self,
        sentence,
        word_assessments,
    ):

        assessment = SentenceAssessment(
            sentence=sentence,
        )

        assessment.words = word_assessments

        assessment.total_words = len(
            word_assessments
        )

        for word in word_assessments:

            if word.accuracy < 100:

                assessment.weak_words.append(
                    word.word
                )

        if assessment.total_words > 0:

            total_accuracy = sum(
                word.accuracy
                for word in word_assessments
            )

            assessment.accuracy = round(
                total_accuracy
                / assessment.total_words,
                2,
            )

        return assessment