from app.services.pronunciation.text_document_builder import (
    TextDocumentBuilder,
)

from app.services.recognition.recognition_service import (
    RecognitionService,
)

from app.pipelines.speech_assessment_pipeline import (
    SpeechAssessmentPipeline,
)
from app.constants.trace_stage import TraceStage
from app.constants.trace_status import TraceStatus
from app.services.recognition.recognition_normalizer import (
    RecognitionNormalizer,
)
builder = TextDocumentBuilder()
normalizer = RecognitionNormalizer()
reference_text="The passengers climbed aboard."
student_text = "The passengers climbed a board."
sentence_pairs = [
    {
        "Reference": "I traveled aboard the ship.",
        "Student": "I traveled a board the ship."
    },
    {
        "Reference": "She walked into the room.",
        "Student": "She walked in to the room."
    },
    {
        "Reference": "I cannot attend the meeting.",
        "Student": "I can not attend the meeting."
    },
    {
        "Reference": "The teacher wrote on the blackboard.",
        "Student": "The teacher wrote on the black board."
    },
    {
        "Reference": "The classroom is very clean.",
        "Student": "The class room is very clean."
    },
    {
        "Reference": "I bought a board.",
        "Student": "I bought a board."
    }
]
for pair in sentence_pairs:
    reference = pair["Reference"]
    student = pair["Student"]
    reference_doc = (
        builder.build(
            reference,
            "en"
        )
    )
    student_doc = (
        builder.build(student,"en")
    )
    recognition_student, merges = (
                normalizer.normalize(
                    reference_doc,
                    student_doc,
                )
            )
    print("="*60)
    print("Reference:",reference)
    print("Student:",student)
    print("="*60)
    for word in recognition_student.words:
        print("NormalizedWord:",word.normalized)