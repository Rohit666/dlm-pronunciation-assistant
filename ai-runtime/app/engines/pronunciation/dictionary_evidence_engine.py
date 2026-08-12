from app.core.resource_manager import (
    ResourceManager,
)

from app.models.evidence_source import (
    EvidenceSource,
)

from app.models.word_evidence import (
    WordEvidence,
)


class DictionaryEvidenceEngine:

    def __init__(self):

        self.variants = (
            ResourceManager
            .recognition()
            .dictionary_variants()
        )

    def evaluate(
        self,
        reference,
        student,
    ):

        evidence = WordEvidence(

            source=EvidenceSource.DICTIONARY,

            name="Dictionary Variant",

            weight=0.20,

        )

        reference_word = (
            reference.normalized.lower()
        )

        student_word = (
            student.normalized.lower()
        )

        for variants in self.variants.values():

            variant_set = {
                word.lower()
                for word in variants
            }

            if (
                reference_word in variant_set
                and student_word in variant_set
            ):

                evidence.score = 1.0

                evidence.explanations.append(

                    "Accepted spelling variant."

                )

                return evidence

        evidence.score = 0.0

        evidence.explanations.append(

            "No dictionary variant match."

        )

        return evidence