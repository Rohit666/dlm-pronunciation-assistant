from app.services.feedback.feedback_generation_service import (
    FeedbackGenerationService,
)
from app.models.phoneme_token import PhonemeToken
from app.models.word_pronunciation import WordPronunciation
from app.models.pronunciation_document import PronunciationDocument

from app.pipelines.speech_assessment_pipeline import (
    SpeechAssessmentPipeline,
)

# -----------------------------
# Build Pronunciation Document
# -----------------------------

document = PronunciationDocument()

word1 = WordPronunciation(
    word="The",
)

word1.phonemes = [

    PhonemeToken(
        symbol="ð",
        stress=False,
        secondary_stress=False,
        long=False,
        category="consonant",
    ),

    PhonemeToken(
        symbol="ə",
        stress=False,
        secondary_stress=False,
        long=False,
        category="vowel",
    ),

]

word2 = WordPronunciation(
    word="three",
)

word2.phonemes = [

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

word3 = WordPronunciation(
    word="boys",
)

word3.phonemes = [

    PhonemeToken(
        symbol="b",
        stress=False,
        secondary_stress=False,
        long=False,
        category="consonant",
    ),

    PhonemeToken(
        symbol="ɔɪ",
        stress=False,
        secondary_stress=False,
        long=False,
        category="diphthong",
    ),

    PhonemeToken(
        symbol="z",
        stress=False,
        secondary_stress=False,
        long=False,
        category="consonant",
    ),

]

document.words.extend([
    word1,
    word2,
    word3,
])

reference = document.flatten()

# -----------------------------
# Student pronunciation
# -----------------------------

student = [

    # The
    PhonemeToken(
        symbol="ð",
        stress=False,
        secondary_stress=False,
        long=False,
        category="consonant",
    ),

    PhonemeToken(
        symbol="ə",
        stress=False,
        secondary_stress=False,
        long=False,
        category="vowel",
    ),

    # three
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

    # boys
    PhonemeToken(
        symbol="b",
        stress=False,
        secondary_stress=False,
        long=False,
        category="consonant",
    ),

    PhonemeToken(
        symbol="ɔɪ",
        stress=False,
        secondary_stress=False,
        long=False,
        category="diphthong",
    ),

    PhonemeToken(
        symbol="z",
        stress=False,
        secondary_stress=False,
        long=False,
        category="consonant",
    ),

]

pipeline = SpeechAssessmentPipeline()

result = pipeline.assess(
    document,
    student,
)
# result comes from
# SpeechAssessmentPipeline.assess()

feedback = (
    FeedbackGenerationService().generate(
        result
    )
)

print()

for word in feedback.words:

    print()

    print(word.word)

    print(word.accuracy)

    print(word.messages)