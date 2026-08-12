from dataclasses import dataclass


@dataclass
class ProviderValidationResult:
    available: bool
    source: str
    path: str | None
    version: str | None = None
    message: str | None = None