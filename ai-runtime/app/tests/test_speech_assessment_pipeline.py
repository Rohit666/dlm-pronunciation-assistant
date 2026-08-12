from app.models.phoneme_token import PhonemeToken
from app.models.word_pronunciation import WordPronunciation
from app.models.pronunciation_document import PronunciationDocument

from app.pipelines.speech_assessment_pipeline import (
    SpeechAssessmentPipeline,
)
from app.services.learning.learning_diagnosis_service import (
    LearningDiagnosisService,
)
from app.models.speech_assessment_request import (
    SpeechAssessmentRequest,
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
request = SpeechAssessmentRequest(

    language="en",
    reference=document,
    student_phonemes=student,

)

response = pipeline.assess(
    request
)
print(type(response).__name__)

print()

print(
    response.assessment.pronunciation.overall_accuracy
)

print()

for word in response.feedback.words:

    print(
        word.word,
        word.messages,
    )

print()

for need in response.diagnosis.needs:

    print(
        need.target,
        need.severity,
    )
# print()

# print(type(result).__name__)

# print()

# print(
#     "Pronunciation:",
#     result.pronunciation.overall_accuracy,
# )

# print()

# print("Words")

# for word in result.words:

#     print(
#         word.word,
#         word.accuracy,
#     )

# print()

# print("Sentences")

# for sentence in result.sentences:

#     print(
#         sentence.sentence,
#         sentence.accuracy,
#     )
# diagnosis = (
#     LearningDiagnosisService().diagnose(
#         result
#     )
# )

# print()

# print("Learning Needs")

# print("--------------------------------")

# for need in diagnosis.needs:

#     print()

#     print(
#         "Target      :",
#         need.target,
#     )

#     print(
#         "Type        :",
#         need.type,
#     )

#     print(
#         "Severity    :",
#         need.severity,
#     )

#     print(
#         "Priority    :",
#         need.priority,
#     )

#     print(
#         "Similarity  :",
#         need.similarity,
#     )

#     print(
#         "Confidence  :",
#         need.confidence,
#     )

#     print(
#         "Occurrences :",
#         need.occurrences,
#     )

#     print(
#         "Features    :",
#         need.changed_features,
#     )