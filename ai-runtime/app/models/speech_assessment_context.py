from dataclasses import dataclass, field

from app.models.feedback_document import (
    FeedbackDocument,
)

from app.models.learning_diagnosis import (
    LearningDiagnosis,
)

from app.models.pronunciation_assessment import (
    PronunciationAssessment,
)

from app.models.pronunciation_assessment_document import (
    PronunciationAssessmentDocument,
)

from app.models.recognition_document import (
    RecognitionDocument,
)

from app.models.sentence_assessment import (
    SentenceAssessment,
)

from app.models.word_assessment import (
    WordAssessment,
)
from app.models.trace.assessment_trace import (AssessmentTrace)

@dataclass
class SpeechAssessmentContext:
    recognition: RecognitionDocument | None = None
    reference_document = None
    pronunciation: PronunciationAssessment | None = None
    word_pronunciations: list = field(
        default_factory=list
    )
    words: list[WordAssessment] = field(
        default_factory=list
    )
    sentences: list[SentenceAssessment] = field(
        default_factory=list
    )
    feedback: FeedbackDocument | None = None
    diagnosis: LearningDiagnosis | None = None
    assessment_document: PronunciationAssessmentDocument | None = None
    trace: AssessmentTrace = field(
        default_factory=AssessmentTrace
    )