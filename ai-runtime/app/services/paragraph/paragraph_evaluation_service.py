import re

from app.models.paragraph_evaluation import (
    ParagraphEvaluationRequest,
    ParagraphMetrics,
    ParagraphEvaluationResponse,
)

# ---------------------------------------------------------------------
# Milestone 10 — offline subjective paragraph evaluator.
#
# Deviation from the spec's suggested stack, disclosed: no spacy / nltk /
# language_tool_python dependency is used, even though none of the three
# would be blocked here. All three need something fetched at first use
# to do real work — spacy needs a downloaded language model,
# language_tool_python bundles/downloads a full Java LanguageTool
# server the first time it runs — which works against "must run
# completely offline and locally" the moment a fresh install has no
# network access yet, and the existing ai-runtime/requirements.txt
# carries zero NLP dependencies today. Implemented instead with the
# stdlib `re`-based heuristics the spec explicitly allows as the
# fallback path ("... or regex matching" / "fallback heuristic
# metrics") as the ONLY path — zero new packages, zero model downloads,
# genuinely offline from a bare `pip install -r requirements.txt`.
# ---------------------------------------------------------------------

HTML_TAG_RE = re.compile(r"<[^>]+>")
WORD_RE = re.compile(r"[A-Za-z']+")
SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!?])\s+")
REPEATED_WORD_RE = re.compile(r"\b(\w+)\s+\1\b", re.IGNORECASE)

# Crude suffix-stripping in place of real lemmatization (see module
# docstring above) — good enough to match "skill"/"skills",
# "outcome"/"outcomes", "explain"/"explained"/"explaining" without a
# model, not a linguistically complete lemmatizer.
_SUFFIXES = ("ies", "ing", "edly", "ed", "es", "ly", "s")


def _lemma(token: str) -> str:
    lowered = token.lower()
    for suffix in _SUFFIXES:
        if len(lowered) > len(suffix) + 2 and lowered.endswith(suffix):
            if suffix == "ies":
                return lowered[: -len(suffix)] + "y"
            return lowered[: -len(suffix)]
    return lowered


def _strip_html(text: str) -> str:
    return HTML_TAG_RE.sub(" ", text or "")


def _tokenize(text: str):
    return WORD_RE.findall(text)


def _score_word_count(word_count: int, min_word_count: int, max_word_count):
    if min_word_count and word_count < min_word_count:
        return max(0.0, word_count / min_word_count), False

    if max_word_count and word_count > max_word_count:
        overflow_ratio = (word_count - max_word_count) / max_word_count
        return max(0.0, 1.0 - overflow_ratio), True

    return 1.0, True


def _score_keywords(clean_text: str, keywords):
    if not keywords:
        return 1.0, [], []

    normalized_text = " ".join(_lemma(tok) for tok in _tokenize(clean_text))
    found, missing = [], []

    for keyword in keywords:
        keyword_lemmas = " ".join(_lemma(tok) for tok in _tokenize(keyword))
        if keyword_lemmas and keyword_lemmas in normalized_text:
            found.append(keyword)
        else:
            missing.append(keyword)

    ratio = len(found) / len(keywords)
    return ratio, found, missing


def _score_mechanics(clean_text: str):
    stripped = clean_text.strip()
    sentences = [s.strip() for s in SENTENCE_SPLIT_RE.split(stripped) if s.strip()]

    penalty = 0.0

    if not sentences:
        return 0.0, 1.0

    capitalization_errors = sum(
        1 for s in sentences if s and not s[0].isupper() and not s[0].isdigit()
    )
    penalty += min(0.3, capitalization_errors * 0.1)

    repeated_words = len(REPEATED_WORD_RE.findall(stripped))
    penalty += min(0.3, repeated_words * 0.15)

    # Run-on heuristic: a long sentence with no internal comma at all —
    # no pacing, one unbroken clause.
    run_ons = sum(
        1 for s in sentences if len(_tokenize(s)) > 40 and "," not in s
    )
    penalty += min(0.3, run_ons * 0.15)

    if stripped and stripped[-1] not in ".!?":
        penalty += 0.1

    penalty = min(1.0, penalty)
    return round(1.0 - penalty, 4), round(penalty, 4)


def _score_lexical(clean_text: str):
    tokens = [t.lower() for t in _tokenize(clean_text)]
    if not tokens:
        return 0.0
    return round(len(set(tokens)) / len(tokens), 4)


def _build_feedback(
    word_count,
    min_word_count,
    max_word_count,
    word_count_passed,
    keywords,
    found,
    missing,
    mechanics_penalty,
    lexical_ratio,
):
    parts = []

    if word_count_passed:
        parts.append("Met the minimum word count requirement.")
    else:
        parts.append(
            f"Response is below the minimum word count ({word_count}/{min_word_count})."
        )
    if max_word_count and word_count > max_word_count:
        parts.append(f"Exceeds the maximum word count ({word_count}/{max_word_count}).")

    if keywords:
        parts.append(f"Covered {len(found)}/{len(keywords)} required keywords.")
        if missing:
            parts.append(f"Missing: {', '.join(missing)}.")

    if mechanics_penalty <= 0.1 and lexical_ratio >= 0.5:
        parts.append("Strong vocabulary and sentence structure.")
    elif mechanics_penalty > 0.3:
        parts.append("Watch sentence structure — capitalization, run-ons, or repeated words.")
    elif lexical_ratio < 0.4:
        parts.append("Vocabulary is repetitive — try varying word choice.")

    return " ".join(parts)


class ParagraphEvaluationService:

    def evaluate(
        self,
        request: ParagraphEvaluationRequest,
    ) -> ParagraphEvaluationResponse:

        rubric = request.rubric
        points = float(rubric.points or 5)
        passing_percentage = (
            rubric.passing_percentage
            if rubric.passing_percentage is not None
            else 0.6
        )

        clean_text = _strip_html(request.student_text or "")
        word_count = len([w for w in clean_text.strip().split() if w])

        word_count_score, word_count_passed = _score_word_count(
            word_count,
            rubric.min_word_count or 0,
            rubric.max_word_count,
        )

        keyword_ratio, found, missing = _score_keywords(clean_text, rubric.keywords or [])

        mechanics_score, mechanics_penalty = _score_mechanics(clean_text)

        lexical_ratio = _score_lexical(clean_text)

        composite_ratio = (
            keyword_ratio * 0.40
            + word_count_score * 0.30
            + mechanics_score * 0.20
            + lexical_ratio * 0.10
        )
        composite_ratio = max(0.0, min(1.0, composite_ratio))

        score_awarded = round(composite_ratio * points, 2)
        is_correct = score_awarded >= round(points * passing_percentage, 4)

        feedback = _build_feedback(
            word_count,
            rubric.min_word_count or 0,
            rubric.max_word_count,
            word_count_passed,
            rubric.keywords or [],
            found,
            missing,
            mechanics_penalty,
            lexical_ratio,
        )

        return ParagraphEvaluationResponse(
            success=True,
            attempt_answer_id=request.attempt_answer_id,
            score_awarded=score_awarded,
            max_points=points,
            is_correct=is_correct,
            metrics=ParagraphMetrics(
                word_count=word_count,
                word_count_score=round(word_count_score, 4),
                word_count_passed=word_count_passed,
                keywords_found=found,
                keywords_missing=missing,
                keyword_match_ratio=round(keyword_ratio, 4),
                mechanics_score=mechanics_score,
                mechanics_penalty=mechanics_penalty,
                lexical_diversity_ratio=lexical_ratio,
            ),
            feedback=feedback,
        )
