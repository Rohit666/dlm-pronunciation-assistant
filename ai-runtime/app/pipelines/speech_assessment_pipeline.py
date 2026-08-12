
from app.models.speech_assessment_context import (
    SpeechAssessmentContext,
)

from app.models.speech_assessment_response import (
    SpeechAssessmentResponse,
)

from app.models.pronunciation_assessment_document import (
    PronunciationAssessmentDocument,
)

from app.services.assessment.pronunciation_assessment_service import (
    PronunciationAssessmentService,
)

from app.services.assessment.word_assessment_service import (
    WordAssessmentService,
)

from app.services.assessment.sentence_assessment_service import (
    SentenceAssessmentService,
)

from app.services.feedback.feedback_generation_service import (
    FeedbackGenerationService,
)

from app.services.learning.learning_diagnosis_service import (
    LearningDiagnosisService,
)
from app.services.pronunciation.pronunciation_enricher import (
    PronunciationEnricher,
)
from app.models.recognition_status import (
    RecognitionStatus
)
from app.constants.trace_stage import TraceStage
from app.constants.trace_status import TraceStatus

class SpeechAssessmentPipeline:

    def __init__(
        self,
        language="en",
    ):

        self.language = language
        self.pronunciation_service = (
            PronunciationAssessmentService(
                language
            )
        )
        self.word_service = (
            WordAssessmentService()
        )
        self.sentence_service = (
            SentenceAssessmentService()
        )
        self.feedback_service = (
            FeedbackGenerationService(
                language
            )
        )
        self.diagnosis_service = (
            LearningDiagnosisService()
        )
        self.enricher = (
            PronunciationEnricher()
        )
        
    def assess(
        self,
        recognition_document,
    ):
        
        context = SpeechAssessmentContext()
        context.recognition = recognition_document
        context.trace.log(
            TraceStage.ASSESSMENT,
            TraceStatus.INFO,
            "Assessment started",
        )
        self._prepare_reference(
            context
        )
        context.trace.log(
            TraceStage.REFERENCE,
            TraceStatus.INFO,
            "Reference prepared",
        )
               
        self._assess_pronunciation(
            context
        )
        context.trace.log(
            TraceStage.PRONUNCIATION,
            TraceStatus.INFO,
            "Pronunciation assessment completed",
        )
        self._assess_words(
            context
        )   
        context.trace.log(
            TraceStage.WORDS,
            TraceStatus.INFO,
            "Word assessment service completed",
        )
        self._assess_sentences(
            context
        )
        context.trace.log(
            TraceStage.SENTENCES,
            TraceStatus.INFO,
            "Sentence assessment service completed",
        )
        self._generate_feedback(
            context
        )
        context.trace.log(
            TraceStage.FEEDBACK,
            TraceStatus.INFO,
            "Feedback generated",
        )
        self._generate_diagnosis(
            context
        )
        context.trace.log(
            TraceStage.DIAGNOSIS,
            TraceStatus.INFO,
            "Diagnosis completed",
        )
        
        return self._build_response(
            context
        )
        

    # -------------------------------------------------

    def _prepare_reference(
        self,
        context,
    ):

        if not context.recognition.words:
            return

        context.reference_document = (
            context.recognition.reference_document
        )
        
    # -------------------------------------------------

    def _assess_pronunciation(
        self,
        context,
    ):

        context.word_pronunciations = []

        pronunciations = []

        for recognition in context.recognition.words:

            #
            # Enrich reference pronunciation
            #
            if recognition.reference:

                recognition.reference = (
                    self.enricher.enrich(
                        recognition.reference
                    )
                )

            #
            # Enrich student pronunciation
            #
            if recognition.student:

                recognition.student = (
                    self.enricher.enrich(
                        recognition.student
                    )
                )

            #
            # Assess this word.
            #
            pronunciation = (
                self.pronunciation_service.assess_word(
                    recognition
                )
            )

            #
            # Keep the word-level assessment
            # for the UI and word analysis.
            #
            context.word_pronunciations.append(
                (
                    recognition,
                    pronunciation,
                )
            )

            #
            # Collect pronunciation assessments
            # for overall aggregation.
            #
            pronunciations.append(
                pronunciation
            )

        #
        # Aggregate the already-assessed words.
        #
        context.pronunciation = (
            self.pronunciation_service.aggregate(
                pronunciations
            )
        )
    # -------------------------------------------------

    def _assess_words(
        self,
        context,
    ):
        context.words = []
        for (
            recognition,
            pronunciation,
        ) in context.word_pronunciations:
            assessment = (
                self.word_service.assess(
                    recognition,
                    pronunciation,
                )
            )
            context.words.append(
                assessment
            )
    # -------------------------------------------------

    def _assess_sentences(
        self,
        context,
    ):
        sentence = (
            self.sentence_service.assess(
                sentence=" ".join(
                    word.word
                    for word in context.reference_document.words
                ),
                word_assessments=context.words,
            )
        )
        context.sentences = [
            sentence
        ]
    # -------------------------------------------------
    def _build_assessment_document(
        self,
        context,
    ):
        document = (
            PronunciationAssessmentDocument()
        )
        document.pronunciation = (
            context.pronunciation
        )
        document.words = (
            context.words
        )
        document.sentences = (
            context.sentences
        )
        return document
    # -------------------------------------------------
    def _generate_feedback(
        self,
        context,
    ):
        assessment = (

            self._build_assessment_document(
                context
            )
        )
        context.feedback = (

            self.feedback_service.generate(
                assessment
            )
        )
    # -------------------------------------------------

    def _generate_diagnosis(
        self,
        context,
    ):
        assessment = (
            self._build_assessment_document(
                context
            )
        )
        context.trace.log(
            TraceStage.DIAGNOSIS,
            TraceStatus.INFO,
            "Diagnosis started",
        )
        context.diagnosis = (
            self.diagnosis_service.diagnose(
                assessment
            )
        )
    # -------------------------------------------------
    def _build_response(
        self,
        context,
    ):
        context.trace.log(
            TraceStage.RESPONSE,
            TraceStatus.INFO,
            "Response Construction Started",
        )
        assessment = (
            self._build_assessment_document(
                context
            )
        )
        return SpeechAssessmentResponse(
            assessment_document=assessment,
            feedback=context.feedback,
            diagnosis=context.diagnosis,
        )