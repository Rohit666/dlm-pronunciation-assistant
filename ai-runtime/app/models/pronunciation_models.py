from pydantic import BaseModel # type: ignore


class PhonemeRequest(BaseModel):

    text: str


class PhonemeMetadata(BaseModel):

    engine: str

    processingTime: float

    runtimeVersion: str


class PhonemeResponse(BaseModel):

    success: bool

    text: str

    ipa: str

    metadata: PhonemeMetadata