from dataclasses import dataclass,field
from app.models.pronunciation_assessment_document import (
    PronunciationAssessmentDocument,
)
from app.models.feedback_document import (
    FeedbackDocument,
)
from app.models.learning_diagnosis import (
    LearningDiagnosis,
)
from app.models.recognition_status import (RecognitionStatus)
from app.models.trace.assessment_trace import AssessmentTrace
@dataclass
class SpeechAssessmentResponse:

    assessment_document: PronunciationAssessmentDocument = field(
        default_factory=PronunciationAssessmentDocument
    )
    feedback: FeedbackDocument = field(
        default_factory=FeedbackDocument
    )
    diagnosis: LearningDiagnosis = field(
        default_factory=LearningDiagnosis
    )
    transcript: str = ""
    recognition: RecognitionStatus | None = None
    trace: AssessmentTrace = field(
        default_factory=AssessmentTrace
    )