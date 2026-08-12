from dataclasses import dataclass, field
from app.models.evidence_source import (
    EvidenceSource,
)

@dataclass
class WordEvidence:
    source: EvidenceSource
    name: str
    score: float = 0.0
    weight: float = 1.0
    explanations: list[str] = field(default_factory=list)