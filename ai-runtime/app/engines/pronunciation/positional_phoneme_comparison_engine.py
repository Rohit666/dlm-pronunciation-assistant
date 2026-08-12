from app.models.alignment_operation import (
    AlignmentOperation,
)

from app.services.pronunciation.phoneme_comparison import (
    PhonemeComparisonResult,
    PhonemeComparisonStep,
)

from app.engines.pronunciation.relationship_engine import (
    RelationshipEngine,
)


class PositionalPhonemeComparisonEngine:

    def __init__(self):

        self.relationship = (
            RelationshipEngine()
        )

    def compare(
        self,
        reference,
        student,
    ):

        result = PhonemeComparisonResult()
        result.total_expected = len(reference)
        result.total_detected = len(student)
        total = max(
            len(reference),
            len(student),
        )
        for index in range(total):

            expected = (
                reference[index]
                if index < len(reference)
                else None
            )

            detected = (
                student[index]
                if index < len(student)
                else None
            )           
            matched = (
                expected is not None
                and detected is not None
                and expected.symbol == detected.symbol
            )

            if matched:
                result.exact_matches += 1
            if matched:
                operation = AlignmentOperation.EXACT_MATCH
            elif expected and detected:
                operation = AlignmentOperation.SUBSTITUTION
            elif expected:
                operation = AlignmentOperation.DELETION
            else:
                operation = AlignmentOperation.INSERTION

            relationship = None
            if (
                expected is not None
                and detected is not None
                and expected.knowledge is not None
            ):
                relationship = (
                    expected.knowledge.relationship_cache.get(
                        detected.symbol
                    )
                )

            result.steps.append(
                PhonemeComparisonStep(
                    index=index,
                    expected=expected,
                    detected=detected,
                    operation=operation,
                    relationship=relationship,
                    matched=matched,

                )

            )

        return result