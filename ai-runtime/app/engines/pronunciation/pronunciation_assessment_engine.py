from app.engines.pronunciation.pronunciation_statistics_engine import (
    PronunciationStatisticsEngine,
)
from app.engines.pronunciation.pronunciation_scoring_engine import (
    PronunciationScoringEngine,
)
from app.models.pronunciation_assessment import(
    PronunciationAssessment
)
class PronunciationAssessmentEngine:

    def __init__(self):

        self.statistics = (
            PronunciationStatisticsEngine()
        )

        self.scoring = (
            PronunciationScoringEngine()
        )

    def assess(
        self,
        comparison,
    ):

        assessment = (
            self.statistics.build(
                comparison
            )
        )

        assessment.overall_accuracy = (
            self.scoring.calculate(
                assessment
            )
        )

        return assessment

    # -------------------------------------------------
    # Aggregate word-level pronunciation assessments
    # -------------------------------------------------

    def aggregate(
        self,
        pronunciations,
    ):

        assessment = PronunciationAssessment()

        for pronunciation in pronunciations:

            if pronunciation is None:
                continue

            #
            # Aggregate reference phonemes
            #
            assessment.total_reference += (
                pronunciation.total_reference
            )

            #
            # Aggregate exact matches
            #
            assessment.exact_matches += (
                pronunciation.exact_matches
            )

            #
            # Aggregate substitutions
            #
            assessment.substitutions += (
                pronunciation.substitutions
            )

            #
            # Aggregate deletions
            #
            assessment.deletions += (
                pronunciation.deletions
            )

            #
            # Aggregate insertions
            #
            assessment.insertions += (
                pronunciation.insertions
            )

            #
            # Preserve weak phonemes
            #
            assessment.weak_phonemes.extend(
                pronunciation.weak_phonemes
            )

        #
        # Binary positional scoring
        #
        if assessment.total_reference > 0:

            assessment.overall_accuracy = round(
                (
                    assessment.exact_matches
                    /
                    assessment.total_reference
                )
                * 100,
                2,
            )

        return assessment