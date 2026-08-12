from app.engines.pronunciation.text_similarity_engine import (
    TextSimilarityEngine,
)

engine = (
    TextSimilarityEngine()
)

tests = [

    (
        "Exact",
        "three",
        "three",
    ),

    (
        "Recognition",
        "three",
        "tree",
    ),

    (
        "Plural",
        "boy",
        "boys",
    ),

    (
        "Different",
        "three",
        "robot",
    ),

    (
        "Case",
        "Three",
        "three",
    ),

]

print()

print(
    "Text Similarity Test"
)

print(
    "-" * 40
)

for title, reference, student in tests:

    similarity = (
        engine.similarity(
            reference,
            student,
        )
    )

    print()

    print(title)

    print(
        reference,
        "->",
        student,
    )

    print(
        "Similarity:",
        similarity,
    )