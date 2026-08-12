from dataclasses import dataclass


@dataclass
class RuntimeMetadata:

    engine: str
    processing_time: float
    runtime_version: str
    model: str | None = None