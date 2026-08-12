import time

from fastapi import APIRouter # type: ignore

from app.core.config import VERSION

from app.models.pronunciation_models import (
    PhonemeRequest,
    PhonemeResponse,
)

from app.services.pronunciation.phoneme_service import (
    PhonemeService,
)
from app.models.speech_assessment_request import (
    SpeechAssessmentRequest,
)
from app.pipelines.speech_assessment_pipeline import (
    SpeechAssessmentPipeline,
)
router = APIRouter(
    prefix="/pronunciation",
    tags=["Pronunciation"],
)

phoneme_service = PhonemeService()


@router.post(
    "/phonemes",
    response_model=PhonemeResponse,
)
def phonemes(request: PhonemeRequest):

    start = time.perf_counter()

    ipa = phoneme_service.text_to_ipa(
        request.text,
    )

    return {

        "success": True,

        "text": request.text,

        "ipa": ipa,

        "metadata": {

            "engine": "eSpeak NG",

            "processingTime": round(
                time.perf_counter() - start,
                3,
            ),

            "runtimeVersion": VERSION,

        },

    }
@router.post(
    "/assess",
)
async def assess(
    request: SpeechAssessmentRequest,
):
    pipeline = SpeechAssessmentPipeline(
        request.language
    )
    response = pipeline.assess(
        request
    )
    return response