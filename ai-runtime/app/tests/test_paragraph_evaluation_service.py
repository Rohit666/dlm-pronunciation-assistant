from app.models.paragraph_evaluation import (
    ParagraphEvaluationRequest,
    ParagraphRubric,
)
from app.services.paragraph.paragraph_evaluation_service import (
    ParagraphEvaluationService,
)

service = ParagraphEvaluationService()


def _request(text, **rubric_overrides):
    rubric = ParagraphRubric(
        points=5,
        min_word_count=20,
        max_word_count=150,
        keywords=["lesson", "sentence", "outcomes", "skills"],
        passing_percentage=0.6,
        **rubric_overrides,
    )
    return ParagraphEvaluationRequest(
        attempt_answer_id=6,
        prompt="<p>Explain the architecture changes...</p>",
        student_text=text,
        rubric=rubric,
    )


def test_strong_answer_passes():
    text = (
        "The lesson sentence outcomes and skills were mapped carefully so the "
        "new module tracked every learning goal without breaking the existing "
        "grading pipeline for other question types."
    )
    result = service.evaluate(_request(text))

    assert result.is_correct is True
    assert result.metrics.keyword_match_ratio == 1.0
    assert result.metrics.word_count_passed is True
    assert result.score_awarded > 0


def test_short_answer_fails_word_count():
    text = "Lesson outcomes were updated."
    result = service.evaluate(_request(text))

    assert result.metrics.word_count_passed is False
    assert result.metrics.word_count_score < 1.0


def test_missing_keywords_reduce_ratio():
    text = (
        "This response talks about something entirely different and never "
        "mentions any of the required terms at all, padding the length out "
        "past the minimum requirement easily."
    )
    result = service.evaluate(_request(text))

    assert result.metrics.keyword_match_ratio == 0.0
    assert "lesson" in result.metrics.keywords_missing


def test_html_is_stripped_before_word_count():
    text = "<p>Lesson</p> <b>sentence</b> outcomes skills " * 5
    result = service.evaluate(_request(text))

    assert result.metrics.word_count > 0
    assert "<" not in result.feedback


def test_repeated_words_penalize_mechanics():
    text = (
        "the the lesson sentence outcomes skills the the lesson sentence "
        "outcomes skills the the lesson sentence outcomes skills more text "
        "to clear the minimum word count threshold for this rubric"
    )
    result = service.evaluate(_request(text))

    assert result.metrics.mechanics_penalty > 0
