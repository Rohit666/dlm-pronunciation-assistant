from app.models.word_evidence import (
    WordEvidence,
)

from app.engines.pronunciation.text_similarity_engine import (
    TextSimilarityEngine,
)
from app.models.evidence_source import (
    EvidenceSource, 
)

class TextEvidenceEngine:

    def __init__(self):

        self.engine = (
            TextSimilarityEngine()
        )

    def evaluate(
        self,
        reference,
        student,
    ):

        similarity = (
            self.engine.similarity(
                reference.word,
                student.word,
            )
        )

        return WordEvidence(
            source=EvidenceSource.TEXT,
            name="Text Similarity",
            score=similarity,
            weight=0.10,
            explanations=[
                f"Text similarity is {similarity:.2f}."
            ],

        )