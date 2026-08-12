from dataclasses import dataclass,field
from datetime import datetime
from app.constants.trace_status import TraceStatus

@dataclass
class TraceEvent:

    stage: str

    status: TraceStatus

    message: str = ""
    metadata: dict[str, int | float] = field(
        default_factory=dict
    )

    duration_ms: float | None = None

    timestamp: datetime | None = None