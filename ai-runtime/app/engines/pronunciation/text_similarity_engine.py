from difflib import SequenceMatcher


class TextSimilarityEngine:
    def similarity(
        self,
        reference,
        student,
    ):

        if (
            reference is None
            or student is None
        ):
            return 0.0
        reference = (
            reference.lower().strip()
        )
        student = (
            student.lower().strip()
        )

        if reference == student:
            return 1.0
        return round(
            SequenceMatcher(
                None,
                reference,
                student,
            ).ratio(),
            2,

        )