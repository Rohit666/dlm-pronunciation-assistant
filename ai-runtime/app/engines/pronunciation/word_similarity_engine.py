from difflib import SequenceMatcher


class WordSimilarityEngine:

    def similarity(
        self,
        reference,
        student,
    ):

        if reference is None or student is None:
            return 0.0

        return SequenceMatcher(
            None,
            reference.lower(),
            student.lower(),
        ).ratio()