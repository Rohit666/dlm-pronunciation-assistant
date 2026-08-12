from app.engines.pronunciation.relationship_engine import (
    RelationshipEngine,
)

engine = RelationshipEngine()

knowledge = engine.knowledge_engine.knowledge

theta = knowledge["θ"]

tee = knowledge["t"]

weights = engine.weight_engine.for_type(
    "consonant"
)

comparison = engine.feature_scorer.score_place(

    theta,

    tee,

    weights,
)

print()

print(comparison)