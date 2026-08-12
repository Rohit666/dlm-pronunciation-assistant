from app.models.feedback_document import (
    FeedbackDocument,
)

from app.models.word_feedback import (
    WordFeedback,
)

from app.engines.pronunciation.knowledge_engine import (
    KnowledgeEngine,
)


class FeedbackGenerationService:

    def __init__(
        self,
        language="en",
    ):

        self.knowledge = (
            KnowledgeEngine(
                language
            )
        )

    def generate(
        self,
        assessment_document,
    ):
        feedback = (
            FeedbackDocument()
        )
        for word in assessment_document.words:
            item = WordFeedback(
                word=word.word,
                accuracy=word.accuracy,
                weak_phonemes=list(
                    word.weak_phonemes
                ),

            )
            for phoneme in word.weak_phonemes:

                knowledge = (
                    self.knowledge.get(
                        phoneme
                    )
                )
                if knowledge is None:
                    continue
                item.messages.append(

                    knowledge.teaching_tip

                )
            feedback.words.append(
                item
            )
        return feedback