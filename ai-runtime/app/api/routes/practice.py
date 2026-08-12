import logging
from fastapi import APIRouter,HTTPException
from pathlib import Path
from app.models.practice_assessment_request import (
    PracticeAssessmentRequest,
)

from app.services.practice.practice_assessment_service import (
    PracticeAssessmentService,
)

router = APIRouter(
    prefix="/practice",
    tags=["Practice"],
)
logger = logging.getLogger(__name__)
assessment_service  = PracticeAssessmentService()

@router.post(
    "/assess",
)
async def assess(
    request: PracticeAssessmentRequest,
):
    try:
        audio_file = Path(request.audio_path)
        if not audio_file.exists():
            raise FileNotFoundError(
                f"Audio file not found: {audio_file}"
            )

        if not audio_file.is_file():
            raise ValueError(
                f"Invalid audio path: {audio_file}"
            )
        print("Audio Path:", audio_file)
        print("Exists:", audio_file.exists())
        print("Size:", audio_file.stat().st_size)
        return assessment_service.assess(request)
    except Exception as ex:
        logger.exception("Request failed")
        raise HTTPException(
            status_code=500,
            detail=str(ex),
        )
    