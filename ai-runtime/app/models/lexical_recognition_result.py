from dataclasses import dataclass, field


@dataclass
class LexicalRecognitionResult:
    accepted: bool = False
    confidence: float = 0.0
    evidence: list[str] = field(
        default_factory=list
    )