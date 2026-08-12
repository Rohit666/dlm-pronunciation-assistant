from dataclasses import dataclass, field

from app.models.alignment_operation import (
    AlignmentOperation,
)

from app.models.phoneme_token import (
    PhonemeToken,
)

from app.models.relationship_result import (
    RelationshipResult,
)


@dataclass
class PhonemeComparisonStep:

    index: int
    expected: PhonemeToken | None = None
    detected: PhonemeToken | None = None
    operation: AlignmentOperation = (
        AlignmentOperation.EXACT_MATCH
    )
    relationship: RelationshipResult | None = None
    matched: bool = False


@dataclass
class PhonemeComparisonResult:

    steps: list[PhonemeComparisonStep] = field(
        default_factory=list
    )
    total_expected: int = 0
    total_detected: int = 0
    exact_matches: int = 0