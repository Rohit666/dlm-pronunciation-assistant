from dataclasses import dataclass

from app.models.relationship_result import (
    RelationshipResult,
)


@dataclass
class SimilarityResult:

    expected_symbol: str

    actual_symbol: str

    relationship: RelationshipResult