from app.engines.pronunciation.word_alignment_engine import (
    WordAlignmentEngine,
)

from app.engines.pronunciation.word_recognition_engine import (
    WordRecognitionEngine,
)

from app.models.recognition_document import (
    RecognitionDocument,
)

from app.models.word_recognition import (
    WordRecognition,
)
from app.models.recognition_status import (
    RecognitionStatus
)
from app.constants.recognition_messages import RecognitionMessage
from app.constants.recognition_state import RecognitionState


class RecognitionService:

    def __init__(
        self,
        language="en",
    ):

        self.alignment = (
            WordAlignmentEngine(
                language,
            )
        )

        self.recognition = (
            WordRecognitionEngine(
                language,
            )
        )

    def recognize(
        self,
        reference,
        student,
    ):

        alignment = self.alignment.align(
            reference.words,
            student.words,
        )

        document = RecognitionDocument(
            reference_document=reference,
            student_document=student,
        )

        for index, step in enumerate(
            alignment.steps
        ):

            recognition = (
                self.recognition.recognize(
                    step.reference,
                    step.student,
                )
            )
            if recognition.accepted:
                document.recognized_words += 1
                
            document.words.append(

                WordRecognition(
                    index=index,
                    reference=step.reference,
                    student=step.student,
                    operation=step.operation,
                    result=recognition,
                )
            )
        document.status = self._build_status(document)
        return document
    
    def _build_status(
        self,
        document,
    ):
        status = RecognitionStatus()

        status.expected_text = self._document_text(
            document.reference_document
        )

        status.detected_text = self._document_text(
            document.student_document
        )

        status.recognized_words = document.recognized_words

        status.total_words = len(
            document.reference_document.words
        )

        #
        # No speech detected
        #
        if not document.student_document.words:
            status.success = False
            status.state = RecognitionState.NO_SPEECH
            status.message = RecognitionMessage.NO_SPEECH_MESSAGE
            return status

        #
        # No matching words
        #
        if document.recognized_words == 0:
            status.success = False
            status.state = RecognitionState.NO_MATCH
            status.message = RecognitionMessage.NO_MATCH_MESSAGE
            return status

        #
        # Perfect recognition
        #
        if (
            document.recognized_words
            == status.total_words
        ):
            status.success = True
            status.state = RecognitionState.SUCCESS
            status.message = ""
            return status

        #
        # Partial recognition
        #
        status.success = True
        status.state = RecognitionState.PARTIAL_MATCH
        status.message = (
            RecognitionMessage.PARTIAL_MATCH_MESSAGE
        )

        return status
    
    def _document_text(
        self,
        document,
    ):
        return " ".join(
            word.word
            for word in document.words
        )