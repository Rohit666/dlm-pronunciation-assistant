from app.models.phoneme_token import (
    PhonemeToken,
)

from app.services.assessment.pronunciation_assessment_service import (
    PronunciationAssessmentService,
)

service = PronunciationAssessmentService()

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

assessment = service.assess(
    reference,
    student,
)

print()

print("Accuracy :", assessment.overall_accuracy)

print("Reference :", assessment.total_reference)

print("Exact :", assessment.exact_matches)

print("Similar :", assessment.similar_matches)

print("Substitutions :", assessment.substitutions)

print("Insertions :", assessment.insertions)

print("Deletions :", assessment.deletions)

print("Weak :", assessment.weak_phonemes)