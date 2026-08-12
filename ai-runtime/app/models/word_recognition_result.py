from dataclasses import dataclass, field

from app.models.word_evidence_collection import (
    WordEvidenceCollection, 
)

@dataclass
class WordRecognitionResult:
    evidence: WordEvidenceCollection = field(default_factory=WordEvidenceCollection)
    accepted: bool = False
    confidence: float = 0.0