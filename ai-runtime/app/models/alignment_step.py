from dataclasses import dataclass

from app.models.alignment_operation import (
    AlignmentOperation,
)

from app.models.relationship_result import (
    RelationshipResult,
)


@dataclass
class AlignmentStep:

    reference_symbol: str | None

    student_symbol: str | None

    operation: AlignmentOperation

    similarity: float

    relationship: RelationshipResult | None