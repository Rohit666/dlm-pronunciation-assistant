from app.models.word_evidence import (
    WordEvidence,
)

from app.models.word_evidence_collection import (
    WordEvidenceCollection,
)

from app.models.evidence_source import (
    EvidenceSource,
)

collection = (
    WordEvidenceCollection()
)

collection.add(

    WordEvidence(

        source=EvidenceSource.TEXT,

        name="Text",

        score=0.9,

        weight=0.1,

        explanations=[
            "High text similarity."
        ],

    )

)

collection.add(

    WordEvidence(

        source=EvidenceSource.IPA,

        name="IPA",

        score=0.85,

        weight=0.5,

        explanations=[
            "One phoneme differs."
        ],

    )

)

collection.add(

    WordEvidence(

        source=EvidenceSource.MORPHOLOGY,

        name="Morphology",

        score=1.0,

        weight=0.2,

        explanations=[
            "Plural suffix removed."
        ],

    )

)

print()

print("Evidence Collection")

print("=" * 60)

print()

print("Count")

print(len(collection))

print()

print("Weighted Score")

print(round(collection.weighted_score(), 2))

print()

print("IPA Evidence")

for evidence in collection.by_source(
    EvidenceSource.IPA
):

    print(evidence.name)

print()

print("All Explanations")

for explanation in collection.explanations():

    print("-", explanation)