from fastapi import APIRouter, HTTPException 

from app.models.speech_models import (
    TranscriptionRequest,
    TranscriptionResponse,
)

from app.services.speech.whisper_service import (
    WhisperService,
)

router = APIRouter(
    prefix="/speech",
    tags=["Speech"],
)

whisper_service = WhisperService()


@router.post(
    "/transcribe",
    response_model=TranscriptionResponse,
)
def transcribe(request: TranscriptionRequest):

    try:

        return whisper_service.transcribe(
            request.audioPath,
            request.language,
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )