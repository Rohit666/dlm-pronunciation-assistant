from dataclasses import dataclass

from app.models.alignment_operation import (
    AlignmentOperation,
)

from app.models.relationship_result import (
    RelationshipResult,
)


@dataclass
class AlignmentCell:

    score: float = 0.0

    previous: tuple[int, int] | None = None

    operation: AlignmentOperation | None = None

    relationship: RelationshipResult | None = None