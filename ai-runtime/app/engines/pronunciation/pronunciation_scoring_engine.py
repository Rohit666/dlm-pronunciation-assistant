

class PronunciationScoringEngine:

    def calculate(
        self,
        assessment,
    ):

        if assessment.total_reference == 0:
            return 0.0

        accuracy = (
            assessment.exact_matches
            /
            assessment.total_reference
        ) * 100

        return round(
            accuracy,
            2,
        )