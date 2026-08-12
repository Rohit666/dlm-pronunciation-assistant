from app.models.similarity_result import (
    SimilarityResult,
)


class SimilarityEngine:

    def compare(
        self,
        expected,
        actual,
    ):

        if expected is None or actual is None:
            return None

        if expected.knowledge is None:
            return None

        relationship = (
            expected.knowledge.relationship_cache.get(
                actual.symbol
            )
        )

        if relationship is None:
            return None

        return SimilarityResult(

            expected_symbol=expected.symbol,

            actual_symbol=actual.symbol,

            relationship=relationship,

        )