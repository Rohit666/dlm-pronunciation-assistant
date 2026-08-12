from app.engines.pronunciation.alignment_engine import (
    AlignmentEngine,
)

engine = AlignmentEngine()

print()

print(type(engine).__name__)

print()

print(type(engine.relationship_engine).__name__)