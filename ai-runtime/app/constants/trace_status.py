from enum import Enum


class TraceStatus(str, Enum):

    INFO = "INFO"

    WARNING = "WARNING"

    ERROR = "ERROR"