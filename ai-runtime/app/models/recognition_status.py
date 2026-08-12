from dataclasses import dataclass

from app.constants.recognition_state import (
    RecognitionState,
)


@dataclass
class RecognitionStatus:

    success: bool = True
    state: RecognitionState = (
        RecognitionState.SUCCESS
    )
    message: str | None = None
    expected_text: str = ""
    detected_text: str = ""
    recognized_words: int = 0
    total_words: int = 0
    recognized_words: int = 0
    total_words: int = 0
    @property
    def recognition_percentage(self):
        if self.total_words == 0:
            return 0.0
        return round(
            (self.recognized_words / self.total_words) * 100,
            2,
        )