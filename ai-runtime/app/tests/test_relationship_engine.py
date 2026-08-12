from app.engines.pronunciation.knowledge_engine import (
    KnowledgeEngine,
)

from app.engines.pronunciation.relationship_engine import (
    RelationshipEngine,
)

knowledge_engine = KnowledgeEngine()

relationship_engine = RelationshipEngine()

relationship_engine.build_relationships(
    knowledge_engine.knowledge
)

theta = knowledge_engine.get("θ")

if theta:

    print()

    print("θ -> t")

    print(
        theta.relationship_cache["t"]
    )

    print()

    print("θ -> f")

    print(
        theta.relationship_cache["f"]
    )

    print()

    print("θ -> θ")

    print(
        theta.relationship_cache["θ"]
    )