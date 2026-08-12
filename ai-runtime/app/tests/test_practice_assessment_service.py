from app.models.practice_assessment_request import (
    PracticeAssessmentRequest,
)

from app.services.practice.practice_assessment_service import (
    PracticeAssessmentService,
)

service = PracticeAssessmentService()

request = PracticeAssessmentRequest(

     #audio_path="D:/dlm-pronunciation-assistant/ai-runtime/app/tests/sample/aboard.wav",
     audio_path="D:/dlm-pronunciation-assistant/ai-runtime/app/tests/sample/iam_a_robot.wav",
    # audio_path="D:/dlm-pronunciation-assistant/ai-runtime/app/tests/sample/the_tree_boys.wav",


    reference_text="The three boys",

    language="en",

)

response = service.assess(
    request
)
print("-"*60)
print("Recognintion")
print("-"*60)
print("Status",response.recognition.state.value)
print("success",response.recognition.success)
print("Expected:",response.recognition.expected_text)
print("Detected:",response.recognition.detected_text)
print("Words ",response.recognition.recognized_words,"/",response.recognition.total_words)
print("Message:",response.recognition.message)
print("Percentage:",response.recognition.recognition_percentage)
print()
print("=" * 60)
print("Overall")
print("=" * 60)

print(
    response.assessment_document.pronunciation.overall_accuracy
)
print(response.trace)
print()

print("=" * 60)
print("Words")
print("=" * 60)

for word in response.assessment_document.words:

    print()

    print(
        f"{word.word:10} -> {word.student_word}"
    )

    print(
        "Accepted:",
        word.accepted,
    )

    print(
        "Recognition:",
        word.confidence,
    )

    print(
        "Pronunciation:",
        word.accuracy,
    )

    print(
        "Weak:",
        word.weak_phonemes,
    )

print()

print("=" * 60)
print("Feedback")
print("=" * 60)

for feedback in response.feedback.words:

    print()

    print(
        feedback.word
    )

    for line in feedback.messages:

        print(
            "-",
            line,
        )

print()

print("=" * 60)
print("Diagnosis")
print("=" * 60)

for need in response.diagnosis.needs:

    print()

    print(
        need.type.value,
        need.target,
        need.severity,
    )