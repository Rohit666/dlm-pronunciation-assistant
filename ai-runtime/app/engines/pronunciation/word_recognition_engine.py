from app.core.resource_manager import ResourceManager

from app.engines.pronunciation.text_evidence_engine import (
    TextEvidenceEngine,
)

from app.engines.pronunciation.ipa_evidence_engine import (
    IPAEvidenceEngine,
)

from app.engines.pronunciation.morphology_evidence_engine import (
    MorphologyEvidenceEngine,
)

from app.models.word_recognition_result import (
    WordRecognitionResult,
)

from app.models.word_evidence import (
    WordEvidence,
)

from app.models.word_evidence_collection import (
    WordEvidenceCollection,
)

from app.models.evidence_source import (
    EvidenceSource,
)
from app.engines.pronunciation.dictionary_evidence_engine import (
    DictionaryEvidenceEngine
)

class WordRecognitionEngine:

   

    def __init__(
        self,
        language="en",
    ):
        self.config = (
            ResourceManager
            .recognition()
        )
      
        self.text = TextEvidenceEngine()

        self.ipa = IPAEvidenceEngine(
            language
        )

        self.morphology = (
            MorphologyEvidenceEngine()
        )
        self.dictionary = (
            DictionaryEvidenceEngine()
        )
    def recognize(
        self,
        reference,
        student,
    ):

        result = (
            WordRecognitionResult()
        )

        if reference is None:

            result.evidence.add(

                WordEvidence(

                    source=EvidenceSource.TEXT,

                    name="Insertion",

                    explanations=[
                        "Student produced an extra word."
                    ],

                )

            )

            return result

        if student is None:

            result.evidence.add(

                WordEvidence(

                    source=EvidenceSource.TEXT,

                    name="Deletion",

                    explanations=[
                        "Student omitted the expected word."
                    ],

                )

            )

            return result

        text = self.text.evaluate(reference, student)
        ipa = self.ipa.evaluate(reference, student)
        morphology = self.morphology.evaluate(reference, student)
        dictionary = self.dictionary.evaluate(reference, student)
        result.evidence.add(text)
        result.evidence.add(ipa)
        result.evidence.add(morphology)
        result.evidence.add(dictionary)
        # Core recognition
        base_confidence = (
            (text.score * text.weight) +
            (ipa.score * ipa.weight)
        ) / (
            text.weight +
            ipa.weight
        )

        confidence = base_confidence

        # Supporting evidence
        if morphology.score == 1.0:
            confidence += self.config.morphology_bonus()

        if dictionary.score == 1.0:
            confidence += self.config.dictionary_bonus()

        result.confidence = round(
            min(confidence, 1.0),
            2,
        )

        result.accepted = (
            result.confidence >=
            self.config.accept_threshold()
        )

        return result