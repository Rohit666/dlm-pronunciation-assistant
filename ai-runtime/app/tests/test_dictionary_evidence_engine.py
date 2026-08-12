from app.engines.pronunciation.dictionary_evidence_engine import (
    DictionaryEvidenceEngine
)
from app.services.pronunciation.text_document_builder import (
    TextDocumentBuilder,
)
from app.models.word_pronunciation import (
    WordPronunciation,
)

engine = DictionaryEvidenceEngine()
tests = [

    ("colour", "color"),

    ("center", "centre"),

    ("analyse", "analyze"),

    ("organise", "organize"),

    ("three", "tree"),

    ("boys", "boy"),

]
print()
print("DictionaryEvidenceEngine")
print("=" * 50)
for reference_text, student_text in tests:
    reference = WordPronunciation(
        word="colour"
    )

    student = WordPronunciation(
        word="color"
    )
    result = engine.evaluate(
        reference,
        student,
    )

    print()

    print(
        f"{reference_text:10} -> {student_text:10}"
    )
    print("Source",result.source)
    print("Name:", result.name)
    print("Score:", result.score)
    print("Weight:", result.weight)
    for explanation in result.explanations:
        print("Explanation:",explanation)
    