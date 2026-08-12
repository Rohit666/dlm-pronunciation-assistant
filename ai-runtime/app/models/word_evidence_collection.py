from dataclasses import dataclass, field

from app.models.word_evidence import (
    WordEvidence,
)


@dataclass
class WordEvidenceCollection:

    evidence: list[
        WordEvidence
    ] = field(
        default_factory=list
    )

    def add(
        self,
        evidence: WordEvidence,
    ):

        self.evidence.append(
            evidence
        )

    def weighted_score(self):

        total_weight = sum(
            e.weight
            for e in self.evidence
        )

        if total_weight == 0:
            return 0.0

        weighted = sum(
            e.score * e.weight
            for e in self.evidence
        )

        return weighted / total_weight

    def by_source(
            self,
            source,
        ):

            return [

                item

                for item

                in self.evidence

                if item.source == source

            ]

    def explanations(
        self,
    ):

        result = []

        for evidence in self.evidence:

            result.extend(
                evidence.explanations
            )

        return result

    def __iter__(
        self,
    ):

        return iter(
            self.evidence
        )

    def __len__(
        self,
    ):

        return len(
            self.evidence
        )