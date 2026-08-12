from dataclasses import dataclass, field

from app.models.feature_comparison import (
    FeatureComparison,
)


@dataclass
class RelationshipResult:

    target_symbol: str

    similarity: float

    penalty: float

    changed_features: list[str]

    explanation: list[str]

    comparisons: list[FeatureComparison] = field(
        default_factory=list
    )