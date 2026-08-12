from app.engines.pronunciation.ipa_tokenizer import (
    IPATokenizer,
)

from app.engines.pronunciation.knowledge_engine import (
    KnowledgeEngine,
)

tokenizer = IPATokenizer()

knowledge_engine = KnowledgeEngine(
    language="en",
)

tokens = tokenizer.tokenize(
    "ˈeɪ_b_əl"
)

tokens = knowledge_engine.enrich(
    tokens
)

for token in tokens:

    print("--------------------------------")

    print("Symbol:", token.symbol)

    print("Knowledge:", token.knowledge)