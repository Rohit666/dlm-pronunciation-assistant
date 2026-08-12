from dataclasses import dataclass

from app.models.phonetic_knowledge import PhoneticKnowledge


@dataclass
class PhonemeToken:

    symbol: str
    stress: bool = False
    secondary_stress: bool = False
    long: bool = False
    category: str = "unknown"
    knowledge: PhoneticKnowledge | None = None
    word_index: int | None = None