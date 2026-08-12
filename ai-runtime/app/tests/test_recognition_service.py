from app.services.pronunciation.text_document_builder import (
    TextDocumentBuilder,
)

from app.services.recognition.recognition_service import (
    RecognitionService,
)

builder = TextDocumentBuilder()

service = RecognitionService()

tests = [

    (
        "Perfect",
        "The boy is playing.",
        "The boy is playing.",
    ),

    (
        "Speechless",
        "The three boys",
        "",
    ),

    (
        "Different",
        "The three boys are playing football.",
        "I am robot",
    ),

]

for title, reference_text, student_text in tests:

    print()
    print("=" * 70)
    print(title)
    print("=" * 70)

    reference = builder.build(
        reference_text
    )

    student = builder.build(
        student_text
    )

    result = service.recognize(
        reference,
        student,
    )

    print("="*50)
    print("detected_text:",result.status.detected_text)
    print("Expected Text:",result.status.expected_text)
    print("Message:",result.status.message)
    print("Success:",result.status.success)
    print("State:",result.status.state.value)
    print("Recognized Words:", result.status.recognized_words)
    print("Total words:",result.status.total_words)
    print("Percentage:",result.status.recognition_percentage)

    print("="*50)
    for word in result.words:

        reference_word = (
            "-"
            if word.reference is None
            else word.reference.word
        )

        student_word = (
            "-"
            if word.student is None
            else word.student.word
        )

        print(
            f"{reference_word:10}"
            " -> "
            f"{student_word:10}"
        )

        print(
            "Operation:",
            word.operation.value,
        )

        print(
            "Accepted:",
            word.result.accepted,
        )

        print(
            "Confidence:",
            word.result.confidence,
        )

        print()