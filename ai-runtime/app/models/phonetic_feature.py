from dataclasses import dataclass, field


@dataclass
class PhoneticFeature:
    symbol: str
    language: str
    type: str
    place: str | None = None
    manner: str | None = None
    voicing: str | None = None
    height: str | None = None
    backness: str | None = None
    rounding: str | None = None
    length: str | None = None
    difficulty: int = 1
    common_substitutions: list[str] = field(default_factory=list)
    teaching_tip: str = ""