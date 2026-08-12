from app.engines.pronunciation.ipa_tokenizer import (
    IPATokenizer,
)

from app.engines.pronunciation.knowledge_engine import (
    KnowledgeEngine,
)

from app.engines.pronunciation.relationship_engine import (
    RelationshipEngine,
)

from app.engines.pronunciation.similarity_engine import (
    SimilarityEngine,
)

tokenizer = IPATokenizer()

knowledge_engine = KnowledgeEngine()

relationship_engine = RelationshipEngine()

relationship_engine.build_relationships(
    knowledge_engine.knowledge
)

similarity_engine = SimilarityEngine()

expected = tokenizer.tokenize("θ")
actual = tokenizer.tokenize("t")

knowledge_engine.enrich(expected)
knowledge_engine.enrich(actual)

result = similarity_engine.compare(
    expected[0],
    actual[0],
)

print()

print(result)