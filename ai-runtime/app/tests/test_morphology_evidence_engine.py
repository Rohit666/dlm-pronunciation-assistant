from app.engines.pronunciation.morphology_evidence_engine import (
    MorphologyEvidenceEngine,
)

from app.models.word_pronunciation import (
    WordPronunciation,
)

engine = (
    MorphologyEvidenceEngine()
)

tests = [

    ("boy", "boys"),

    ("boys", "boy"),

    ("play", "played"),

    ("play", "playing"),

    ("study", "studied"),

    ("study", "studies"),

    ("three", "tree"),

    ("colour", "color"),

    ("voice", "voices"),

]

print()

print(
    "Morphology Evidence"
)

print("=" * 60)

for reference, student in tests:

    evidence = engine.evaluate(

        WordPronunciation(
            word=reference
        ),

        WordPronunciation(
            word=student
        ),

    )

    print()

    print(
        f"{reference:10} -> {student:10}"
    )

    print(
        "Score:",
        evidence.score,
    )

    print(
        "Weight:",
        evidence.weight,
    )

    for explanation in evidence.explanations:

        print(
            "-",
            explanation,
        )