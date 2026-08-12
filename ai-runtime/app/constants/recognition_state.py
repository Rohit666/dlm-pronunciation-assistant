from enum import Enum


class RecognitionState(str, Enum):

    SUCCESS = "success"
    NO_SPEECH = "no_speech"
    NO_MATCH = "no_match"
    PARTIAL_MATCH = "partial_match"