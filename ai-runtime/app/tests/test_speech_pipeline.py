from app.pipelines.speech_assessment_pipeline import (
    SpeechAssessmentPipeline,
)

pipeline = (
    SpeechAssessmentPipeline()
)

print(type(pipeline).__name__)