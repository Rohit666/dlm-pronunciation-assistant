from app.engines.pronunciation.ipa_evidence_engine import (
    IPAEvidenceEngine,
)

from app.services.pronunciation.text_document_builder import (
    TextDocumentBuilder,
)

builder = TextDocumentBuilder()

engine = IPAEvidenceEngine()

tests = [

    ("three", "three"),

    ("three", "tree"),

    ("three", "there"),

    ("three", "their"),

    ("boys", "boy"),

    ("boys", "voice"),

    ("three", "robot"),

]

print()
print("IPA Evidence Test")
print("=" * 60)

for reference_text, student_text in tests:

    reference = (
        builder.build(
            reference_text
        ).words[0]
    )

    student = (
        builder.build(
            student_text
        ).words[0]
    )

    evidence = engine.evaluate(
        reference,
        student,
    )
    print()
    print(
        f"{reference_text:10} -> {student_text:10}"
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
            explanation,
        )