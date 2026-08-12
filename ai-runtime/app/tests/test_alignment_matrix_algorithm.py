from app.engines.pronunciation.alignment_engine import (
    AlignmentEngine,
)

from app.models.phoneme_token import (
    PhonemeToken,
)

engine = AlignmentEngine()

reference = [

    PhonemeToken(
        symbol="θ",
        stress=False,
        secondary_stress=False,
        long=False,
        category="consonant",
    ),

    PhonemeToken(
        symbol="r",
        stress=False,
        secondary_stress=False,
        long=False,
        category="consonant",
    ),
]

student = [

    PhonemeToken(
        symbol="t",
        stress=False,
        secondary_stress=False,
        long=False,
        category="consonant",
    ),

    PhonemeToken(
        symbol="r",
        stress=False,
        secondary_stress=False,
        long=False,
        category="consonant",
    ),
]
result = engine.align(
    reference,
    student,
)

print()

print("Score:", result.score)

print()

for step in result.steps:

    print(step)