from dataclasses import dataclass,field
from app.constants.learning_need_type import LearningNeedType


@dataclass
class LearningNeed:
    type: LearningNeedType
    target: str
    occurrences: int = 0
    substitutions: int = 0
    deletions: int = 0
    attributes: list[str] = field(
        default_factory=list
    )