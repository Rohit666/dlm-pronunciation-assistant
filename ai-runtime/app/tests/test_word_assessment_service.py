from app.models.phoneme_token import (
    PhonemeToken,
)

from app.models.word_pronunciation import (
    WordPronunciation,
)

from app.models.pronunciation_document import (
    PronunciationDocument,
)

from app.services.assessment.pronunciation_assessment_service import (
    PronunciationAssessmentService,
)

from app.services.assessment.word_assessment_service import (
    WordAssessmentService,
)

# -----------------------------
# Build document
# -----------------------------

document = PronunciationDocument()

word = WordPronunciation(
    word="three",
)

word.phonemes = [

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

    PhonemeToken(
        symbol="iː",
        stress=False,
        secondary_stress=False,
        long=True,
        category="vowel",
    ),

]

document.words.append(word)

reference = document.flatten()

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

    PhonemeToken(
        symbol="iː",
        stress=False,
        secondary_stress=False,
        long=True,
        category="vowel",
    ),

]

pronunciation_service = (
    PronunciationAssessmentService()
)

pronunciation = (
    pronunciation_service.assess(
        reference,
        student,
    )
)

service = WordAssessmentService()

assessment = service.assess(

    word_pronunciation=word,

    word_index=0,

    alignment=pronunciation.alignment,

    reference_phonemes=reference,

)

print()

print("Word :", assessment.word)

print("Accuracy :", assessment.accuracy)

print("Exact :", assessment.exact_matches)

print("Similar :", assessment.similar_matches)

print("Substitutions :", assessment.substitutions)

print("Insertions :", assessment.insertions)

print("Deletions :", assessment.deletions)

print("Weak :", assessment.weak_phonemes)

print("Similarity :", assessment.similarity_total)