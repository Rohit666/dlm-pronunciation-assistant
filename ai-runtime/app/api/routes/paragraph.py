import logging

from fastapi import APIRouter, HTTPException  # type: ignore

from app.models.paragraph_evaluation import (
    ParagraphEvaluationRequest,
    ParagraphEvaluationResponse,
)
from app.services.paragraph.paragraph_evaluation_service import (
    ParagraphEvaluationService,
)

router = APIRouter(
    prefix="/evaluate",
    tags=["Paragraph Evaluation"],
)

logger = logging.getLogger(__name__)

evaluation_service = ParagraphEvaluationService()


@router.post(
    "/paragraph",
    response_model=ParagraphEvaluationResponse,
)
def evaluate_paragraph(request: ParagraphEvaluationRequest):
    try:
        return evaluation_service.evaluate(request)
    except Exception as ex:
        logger.exception("Paragraph evaluation failed")
        raise HTTPException(
            status_code=500,
            detail=str(ex),
        )
