from typing import List, Optional

from pydantic import BaseModel  # type: ignore


class ParagraphRubric(BaseModel):

    points: float = 5

    min_word_count: int = 0

    max_word_count: Optional[int] = None

    keywords: List[str] = []

    passing_percentage: Optional[float] = None


class ParagraphEvaluationRequest(BaseModel):

    # Optional and nullable by design: at grading time the Node backend
    # has not yet inserted the exercise_attempt_answers row this score
    # will be written to (its id is only assigned by the DB after every
    # question on the submission has been graded), so there is no real
    # id to send yet. Kept as a passthrough correlation field for
    # logging/tracing on this side, never required for scoring.
    attempt_answer_id: Optional[int] = None

    prompt: Optional[str] = None

    student_text: str

    rubric: ParagraphRubric


class ParagraphMetrics(BaseModel):

    word_count: int

    word_count_score: float

    word_count_passed: bool

    keywords_found: List[str]

    keywords_missing: List[str]

    keyword_match_ratio: float

    mechanics_score: float

    mechanics_penalty: float

    lexical_diversity_ratio: float


class ParagraphEvaluationResponse(BaseModel):

    success: bool

    attempt_answer_id: Optional[int] = None

    score_awarded: float

    max_points: float

    is_correct: bool

    metrics: ParagraphMetrics

    feedback: str
