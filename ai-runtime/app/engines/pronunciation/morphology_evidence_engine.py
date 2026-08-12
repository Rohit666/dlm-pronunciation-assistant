from app.models.word_evidence import (
    WordEvidence,
)

from app.models.evidence_source import (
    EvidenceSource,
)


class MorphologyEvidenceEngine:

    SUFFIXES = [

        "ing",

        "ied",

        "ies",

        "ed",

        "es",

        "s",

    ]

    def evaluate(
        self,
        reference,
        student,
    ):

        reference_stem = (
            self._stem(
                reference.normalized
            )
        )

        student_stem = (
            self._stem(
                student.normalized
            )
        )

        score = (
            1.0
            if reference_stem
            == student_stem
            else 0.0
        )

        evidence = WordEvidence(

            source=EvidenceSource.MORPHOLOGY,

            name="Morphology",

            score=score,

            weight=0.20,

        )

        if score == 1.0:

            evidence.explanations.append(

                "Words share the same base form."

            )

        else:

            evidence.explanations.append(

                "Different base words."

            )

        return evidence

    def _stem(
        self,
        word,
    ):

        word = word.lower()

        if word.endswith("ies"):

            return word[:-3] + "y"

        if word.endswith("ied"):

            return word[:-3] + "y"

        for suffix in self.SUFFIXES:

            if word.endswith(suffix):

                return word[
                    : -len(suffix)
                ]

        return word