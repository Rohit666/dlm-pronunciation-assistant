from app.models.pronunciation_assessment import (
    PronunciationAssessment,
)

from app.models.alignment_operation import (
    AlignmentOperation,
)


class PronunciationStatisticsEngine:

    def build(
        self,
        comparison,
    ):

        assessment = PronunciationAssessment()

        #
        # Keep the positional phoneme comparison
        # as part of the assessment result.
        #
        assessment.phoneme_comparison = (
            comparison
        )

        #
        # Total expected phonemes
        #
        assessment.total_reference = (
            comparison.total_expected
        )

        #
        # Analyse every positional comparison
        #
        for step in comparison.steps:

            #
            # Exact Match
            #
            if (
                step.operation
                == AlignmentOperation.EXACT_MATCH
            ):

                assessment.exact_matches += 1

                continue

            #
            # Substitution
            #
            if (
                step.operation
                == AlignmentOperation.SUBSTITUTION
            ):

                assessment.substitutions += 1

                if step.expected is not None:

                    assessment.weak_phonemes.append(
                        step.expected.symbol
                    )

                continue

            #
            # Deletion
            #
            if (
                step.operation
                == AlignmentOperation.DELETION
            ):

                assessment.deletions += 1

                if step.expected is not None:

                    assessment.weak_phonemes.append(
                        step.expected.symbol
                    )

                continue

            #
            # Insertion
            #
            if (
                step.operation
                == AlignmentOperation.INSERTION
            ):

                assessment.insertions += 1

                continue

        return assessment