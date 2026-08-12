from app.engines.pronunciation.word_alignment_engine import (
    WordAlignmentEngine,
)

from app.models.word_pronunciation import (
    WordPronunciation,
)


engine = WordAlignmentEngine()


def words(text):

    return [
        WordPronunciation(word=w)
        for w in text.split()
    ]


tests = [

    (
        "Perfect Match",
        "The three boys",
        "The three boys",
    ),

    (
        "Tree",
        "The three boys",
        "The tree boys",
    ),

    (
        "Missing Word",
        "The three boys",
        "three boys",
    ),

    (
        "Extra Word",
        "The three boys",
        "The three little boys",
    ),

    (
        "Different Sentence",
        "The three boys",
        "I am robot",
    ),

]


for title, reference, student in tests:

    print()

    print("=" * 60)

    print(title)

    print("=" * 60)

    result = engine.align(

        words(reference),

        words(student),

    )

    for step in result.steps:

        print(

            f"{step.reference.word if step.reference else '-':10}",

            "->",

            f"{step.student.word if step.student else '-':10}",

            step.operation.value,

            step.similarity,

        )