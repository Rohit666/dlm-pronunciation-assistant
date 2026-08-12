from enum import Enum


class EvidenceSource(str, Enum):

    TEXT = "text"
    IPA = "ipa"
    MORPHOLOGY = "morphology"
    PRONUNCIATION = "pronunciation"
    DICTIONARY = "dictionary"