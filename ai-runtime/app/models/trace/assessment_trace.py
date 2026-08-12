from dataclasses import dataclass, field
from datetime import datetime

from app.models.trace.trace_event import TraceEvent
from app.constants.trace_status import TraceStatus

@dataclass
class AssessmentTrace:

    events: list[TraceEvent] = field(
        default_factory=list
    )

    total_duration_ms: float = 0.0

    def add(
        self,
        stage: str,
        status: str,
        message: str = "",
        duration_ms: float | None = None,
    ) -> None:

        self.events.append(

            TraceEvent(

                stage=stage,

                status=status,

                message=message,

                duration_ms=duration_ms,

                timestamp=datetime.now(),

            )

        )

    def log(
        self,
        stage: str,
        status: TraceStatus,
        message: str = "",
        duration_ms: float | None = None,
    ) -> None:

        self.add(
            stage=stage,
            status=status,
            message=message,
            duration_ms=duration_ms,

        )

    def __str__(self):
        lines = []

        lines.append("")
        lines.append("=" * 60)
        lines.append("Assessment Trace")
        lines.append("=" * 60)

        if not self.events:

            lines.append("No trace events.")

        else:

            for event in self.events:

                lines.append(
                    f"[{event.status.value}] {event.stage}"
                )

                if event.message:

                    lines.append(
                        f"  {event.message}"
                    )

                if event.duration_ms is not None:

                    lines.append(
                        f"  {event.duration_ms:.2f} ms"
                    )

                lines.append("")

        lines.append(
            f"Total Duration: "
            f"{self.total_duration_ms:.2f} ms"
        )

        return "\n".join(lines)