from dataclasses import dataclass


@dataclass
class FeatureComparison:

    feature: str

    source: str | None

    target: str | None

    weight: float

    similarity: float

    contribution: float

    explanation: str