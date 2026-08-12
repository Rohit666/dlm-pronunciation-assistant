from dataclasses import dataclass, field

from app.models.phonetic_feature import PhoneticFeature
from app.models.relationship_result import (
    RelationshipResult,
)

@dataclass
class PhoneticKnowledge:
    feature: PhoneticFeature
    difficulty: int
    substitutions: list[str] = field(default_factory=list)
    teaching_tip: str = ""
    relationship_cache: dict[
    str,
    RelationshipResult,
] = field(default_factory=dict)