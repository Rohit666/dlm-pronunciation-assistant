from pydantic import BaseModel 


class PracticeAssessmentRequest(
    BaseModel,
):
    audio_path: str
    reference_text: str
    language: str = "en"