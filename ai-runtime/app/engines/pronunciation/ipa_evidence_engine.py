from app.engines.pronunciation.positional_phoneme_comparison_engine import (
    PositionalPhonemeComparisonEngine,
)

from app.models.word_evidence import (
    WordEvidence,
)

from app.models.evidence_source import (
    EvidenceSource,
)

from app.services.pronunciation.pronunciation_enricher import (
    PronunciationEnricher,
)


class IPAEvidenceEngine:

    def __init__(
        self,
        language="en",
    ):

        self.enricher = (
            PronunciationEnricher()
        )

        self.comparison_engine = (
            PositionalPhonemeComparisonEngine()
        )

    def evaluate(
        self,
        reference,
        student,
    ):

        reference = self.enricher.enrich(
            reference
        )

        student = self.enricher.enrich(
            student
        )

        comparison = (
            self.comparison_engine.compare(
                reference.phonemes,
                student.phonemes,
            )
        )

        if comparison.total_expected == 0:

            score = 0.0

        else:

            score = (
                comparison.exact_matches
                /
                comparison.total_expected
            )

        return WordEvidence(
            source=EvidenceSource.IPA,

            name="IPA Positional Match",

            score=round(
                score,
                2,
            ),

            weight=0.50,

            explanations=[
                f"IPA positional match "
                f"{comparison.exact_matches} "
                f"of "
                f"{comparison.total_expected}."
            ],

        )