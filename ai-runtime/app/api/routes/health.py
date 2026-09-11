import platform

from fastapi import APIRouter # type: ignore

from app.core.runtime_manager import RuntimeManager
from app.core.config import (
    APP_NAME,
    VERSION,
)


router = APIRouter()

@router.get("/health")
def health():
    return {
        "status": "healthy",
         "version": VERSION,
        "runtime": RuntimeManager.validate_runtime(),
        "modules": {
            "speech": True,
            "tts": True,
            "assessment": False,
            "paragraphEvaluation": True,
        },
    }