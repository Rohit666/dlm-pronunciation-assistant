from pydantic import BaseModel 

class TranscriptionRequest(BaseModel):
    audioPath: str
    language: str = "en"


class TranscriptionMetadata(BaseModel):
    engine: str
    model: str
    processingTime: float
    runtimeVersion: str


class TranscriptionResponse(BaseModel):
    success: bool
    transcript: str
    language: str
    metadata: TranscriptionMetadata