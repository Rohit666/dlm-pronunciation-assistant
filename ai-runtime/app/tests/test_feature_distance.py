from app.engines.pronunciation.feature_distance_engine import (
    FeatureDistanceEngine,
)

engine = FeatureDistanceEngine()

print(
    engine.distance(
        "place",
        "dental",
        "alveolar",
    )
)

print(
    engine.distance(
        "place",
        "dental",
        "bilabial",
    )
)

print(
    engine.distance(
        "place",
        "alveolar",
        "alveolar",
    )
)