from app.engines.pronunciation.relationship_engine import (
    RelationshipEngine,
)

engine = RelationshipEngine()

knowledge = engine.knowledge_engine.knowledge

theta = knowledge["θ"]

result = theta.relationship_cache["t"]

print()

print("Similarity :", result.similarity)

print()

for comparison in result.comparisons:

    print(comparison)