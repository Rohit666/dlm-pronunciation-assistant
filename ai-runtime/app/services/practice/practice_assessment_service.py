from app.services.speech.whisper_service import (
    WhisperService,
)

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
from app.models.speech_assessment_response import(
    SpeechAssessmentResponse
)
from app.models.pronunciation_assessment_document import (
    PronunciationAssessmentDocument,
)
from app.models.feedback_document import (
    FeedbackDocument,
)
from app.models.learning_diagnosis import (
    LearningDiagnosis,
)

class PracticeAssessmentService:

    def __init__(
        self,
        language="en",
    ):

        self.language = language

        self.whisper = (
            WhisperService()
        )

        self.builder = (
            TextDocumentBuilder()
        )
        self.recognition_normalizer = (
            RecognitionNormalizer()
        )
        self.recognition = (
            RecognitionService(
                language,
            )
        )

        self.pipeline = (
            SpeechAssessmentPipeline(
                language,
            )
        )

    def assess(
        self,
        request,
    ):

        #
        # Step 1
        # Speech -> Text
        #
        transcription = (
            self.whisper.transcribe(
                request.audio_path,
                request.language,
            )
        )

        #
        # Step 2
        # Build reference document
        #
        reference_document = (
            self.builder.build(
                request.reference_text,
                request.language,
            )
        )

        #
        # Step 3
        # Build student document
        #
        student_document = (
            self.builder.build(
                transcription.transcript,
                request.language,
            )
        )
        #
        # Step 4.1
        # Normalize Recognition
        #
       
        recognition_student, merges = (
            self.recognition_normalizer.normalize(
                reference_document,
                student_document,
            )
        )

        #
        # Step 4.2
        # Word Recognition
        #
        recognition = (
            self.recognition.recognize(
                reference_document,
                recognition_student,
            )
        )
        if not recognition.status.success:
            response = SpeechAssessmentResponse()
            response.recognition = recognition.status
            response.transcript = transcription.transcript
            return response
            

        #
        # Step 5
        # Speech Assessment
        #
        response = self.pipeline.assess(
            recognition
        )
        response.trace.log(
            TraceStage.RESPONSE,
            TraceStatus.INFO,
            "Response Generated"
        )
        response.recognition = recognition.status
        response.transcript = (
            transcription.transcript
        )

        return response