from enum import Enum


class AlignmentOperation(str, Enum):

    EXACT_MATCH = "exact_match"
    INSERTION = "insertion"
    DELETION = "deletion"
    SUBSTITUTION = "substitution"