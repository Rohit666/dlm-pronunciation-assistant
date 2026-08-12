from app.services.pronunciation.text_document_builder import (
    TextDocumentBuilder,
)

from app.services.recognition.recognition_service import (
    RecognitionService,
)

from app.pipelines.speech_assessment_pipeline import (
    SpeechAssessmentPipeline,
)

builder = TextDocumentBuilder()

recognition_service = RecognitionService()

pipeline = SpeechAssessmentPipeline()

reference = builder.build(
    "The three boys"
)

student = builder.build(
    "The tree boys"
)

recognition = recognition_service.recognize(
    reference,
    student,
)

response = pipeline.assess(
    recognition
)

print()
print("Overall")
print("--------------------------------")

print(
    response.assessment_document.pronunciation.overall_accuracy
)

print()

print("Words")
print("--------------------------------")

for word in response.assessment_document.words:

    print(word.word)
    print(
        "Student:",
        word.student_word
    )
    print(
        "Accepted:",
        word.accepted
    )
    print(
        "Confidence:",
        word.confidence
    )
    print(
        "Accuracy:",
        word.accuracy
    )
    print(
        "Weak:",
        word.weak_phonemes
    )
    print()