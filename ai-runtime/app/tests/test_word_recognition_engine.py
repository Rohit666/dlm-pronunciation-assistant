from app.engines.pronunciation.word_recognition_engine import (
    WordRecognitionEngine,
)

from app.services.pronunciation.text_document_builder import (
    TextDocumentBuilder,
)

builder = TextDocumentBuilder()

engine = WordRecognitionEngine()

tests = [

    ("three", "three"),

    ("three", "tree"),

    ("boys", "boy"),

    ("three", "there"),

    ("three", "their"),

    ("boys", "voice"),

    ("colour", "color"),

    ("color", "colour"),

    ("three", "robot"),

]

print()
print("Word Recognition")
print("=" * 70)

for reference_text, student_text in tests:

    reference = builder.build(
        reference_text
    ).words[0]

    student = builder.build(
        student_text
    ).words[0]

    result = engine.recognize(
        reference,
        student,
    )

    print()

    print(
        f"{reference_text:10} -> {student_text:10}"
    )

    print(
        "Accepted:",
        result.accepted,
    )

    print(
        "Confidence:",
        result.confidence,
    )

    print()

    print("Evidence")

    for evidence in result.evidence:

        print(
            f"[{evidence.source.value}] "
            f"{evidence.name}"
        )

        print(
            "Score :",
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

        print()