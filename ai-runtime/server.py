from fastapi import FastAPI # type: ignore[import]
from app.api.routes.speech import router as speech_router
from app.api.routes.health import router as health_router
from app.api.routes.pronunciation import router as pronunciation_router
from app.api.routes.practice import router as practice_router
from app.core.config import (
    APP_NAME,
    VERSION,
)

app = FastAPI(
    title=APP_NAME,
    version=VERSION,
)

app.include_router(health_router)
app.include_router(speech_router)
app.include_router(pronunciation_router)
app.include_router(practice_router)