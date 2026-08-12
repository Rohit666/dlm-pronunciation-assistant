from app.services.pronunciation.text_document_builder import (
    TextDocumentBuilder,
)

builder = TextDocumentBuilder()

tests = [

    "Tree",

    "Boys.",

    "I'm",

    "don't",

    "HELLO!",

    "(three)",

    "colour,",

]

print()

print("Normalization")

print("=" * 40)

for word in tests:

    print(
        f"{word:12} -> {builder.normalize_word(word)}"
    )