# Execution Plan — Normalized Assessment Schema (revision)

Supersedes the `lesson_attempts` design from the previous patch. That
design was reviewed against the real schema
(`dlm_pronunciation_assistant 1.sql`) and correctly identified as
redundant: `practice_attempts` is already the macro attempt container
(`mentee_id` + `lesson_id`), and `practice_sessions` is already the
sentence-level submission log (`lesson_sentence_id` +
`practice_attempt_id`). `lesson_attempts` duplicated that exact grain.
It has been removed — see the revision note at the top of
`20260907090000-content-blocks-and-progressive-attempts.js`.

## Architecture

**Transient Compare vs. Permanent Submit**, split across two endpoints:

- `POST /api/practice/compare` (new — `practiceController.compare`):
  calls the Python AI runtime, caches the raw result in-memory under a
  one-time `assessment_token` (`assessmentCacheService`, 10-minute TTL,
  single-use redemption), returns the evaluation + token. **Never**
  writes a permanent table. A regressed or abandoned comparison costs
  nothing but cache memory, which expires on its own.
- `POST /api/practice` (rewritten — `practiceController.submitPractice`):
  creates the `practice_sessions` row (as it already did), and — if an
  `assessment_token` is supplied — redeems the cached AI payload,
  normalizes it (`utils/assessmentAdapter.js`), and persists it
  atomically as that session's accepted `assessments` row
  (`services/assessmentPersistenceService.js`).

`assessments` is 1:1 with `practice_sessions` — not because of a
uniqueness rule bolted on top, but because a `practice_sessions` row is
now only ever created at submit time, and every submit produces exactly
one assessment. Multiple submissions for the same sentence (a mentee
retrying after already submitting once) simply produce multiple
`practice_sessions` rows, each with its own 1:1 assessment — one of
which is flagged `is_accepted = true` at a time.

### One resolved ambiguity, stated plainly

The spec says the frontend "sends the practice_session_id" to submit,
implying one already exists. Nothing in the current codebase creates a
sentence-level session ahead of a submit call — `practice_sessions` has
always been created *by* the submit call
(`practiceController.submitPractice`, unchanged in this respect).
Rather than invent a new "start session" endpoint that wasn't asked
for, `/api/practice` keeps creating the `practice_sessions` row at
submit time (using `lesson_sentence_id` + `practice_attempt_id`, as it
already did) and attaches the assessment to that same new row in the
same transaction. Functionally identical outcome — a session and its
one assessment exist together — without adding an undiscussed
lifecycle step.

## Normalized hierarchy

```
practice_sessions (existing)
  -> assessments                 1:1
       -> word_assessments       1:N   (canonical, from assessment_document.words —
                                         NOT from sentences[].words, which repeats them)
            -> phoneme_assessments 1:N (from word.pronunciation.phoneme_comparison.steps)
       -> diagnoses               1:1  (from result.diagnosis)
            -> learning_needs     1:N  (from diagnosis.needs)
       -> assessment_snapshots    1:1  (raw_payload / feedback_snapshot / trace, verbatim)
```

Verified field-for-field against the actual ai-runtime Python
dataclasses (`pronunciation_assessment.py`, `word_assessment.py`,
`phoneme_comparison.py`, `relationship_result.py`,
`learning_diagnosis.py`, `learning_need.py`, `recognition_status.py`) —
not guessed. In particular:

- `phoneme_assessments` (`expected_symbol`, `detected_symbol`,
  `similarity`, `operation`, `changed_features`) maps onto
  `PhonemeComparisonStep` + its nested `RelationshipResult` exactly as
  the spec named the columns.
- The document-level whole-sentence `assessment_document.pronunciation
  .phoneme_comparison` is intentionally **not** separately normalized —
  it's redundant with the union of each word's own phoneme comparison,
  and stays fully available in `assessment_snapshots.raw_payload` for
  audit, per the "canonical, don't duplicate" instruction extended
  consistently.
- `word_feedback` (`feedback.words[]` — messages, practice_words,
  animation) is presentation content, not analytical — it lives only in
  `assessment_snapshots.feedback_snapshot`, not as its own table.

## Adapter (`backend/utils/assessmentAdapter.js`)

`normalizeAssessmentPayload(raw)` validates structure, enforces
`accuracy`/`overall_accuracy` in `[0, 100]` and `confidence`/`similarity`
in `[0, 1]` (throws `AssessmentValidationError`, caught by the
controller as HTTP 422), and maps Python naming
(`student_word` → `detected_word`). Mirrors the existing client-side
`frontend/src/features/assessment/adapter/assessmentAdapter.js`, which
already reads this exact ai-runtime response shape for the UI — that
file was the authoritative source for field names here, not guesswork.

## Improvement delta / accepted status

`assessmentPersistenceService.persistAcceptedAssessment` runs one
transaction per submit:

1. Finds the mentee's current `is_accepted = true` assessment for the
   same `lesson_sentence_id` (via its `practice_sessions` join), if any.
2. Flips it to `is_accepted = false`.
3. Creates the new `assessments` row (+ children) with
   `is_accepted = true`.
4. `delta = newAccuracy - priorAcceptedAccuracy` (`null` if this is the
   first submission for that sentence). Intermediate `/compare` tries
   are excluded automatically — they never reach the DB at all.
5. Mirrors `overall_accuracy` onto the legacy `practice_sessions.score`
   and sets `status = "completed"`, so any code still reading
   `practice_sessions` directly (older mentor-review views) keeps
   working.
6. Atomically upserts `student_phoneme_stats` from this assessment's
   phoneme comparisons (same `INSERT ... ON DUPLICATE KEY UPDATE`
   pattern as before — one row per phoneme actually touched).

## Files

### Migrations
- `backend/migrations/20260907090000-content-blocks-and-progressive-attempts.js`
  — revised: `lesson_attempts` creation removed, `content_blocks` +
  `student_phoneme_stats` unchanged.
- `backend/migrations/20260907120000-normalized-assessment-schema.js`
  — new. Creates `assessments`, `word_assessments`,
  `phoneme_assessments`, `diagnoses`, `learning_needs`,
  `assessment_snapshots`; drops `lesson_attempts` defensively in case
  the previous revision of the first migration was already run.

### Backend — models
- `backend/models/PracticeSession.js` — `+status` field (was in the
  real DB dump, missing from the model), `+hasOne Assessment`.
- `backend/models/Assessment.js`, `WordAssessment.js`,
  `PhonemeAssessment.js`, `Diagnosis.js`, `LearningNeed.js`,
  `AssessmentSnapshot.js` — new.
- `backend/models/index.js`, `Mentee.js`, `LessonSentence.js` —
  registrations updated; stale `LessonAttempt` references removed.

### Backend — logic
- `backend/utils/assessmentAdapter.js` — new. Validation/normalization
  adapter.
- `backend/services/assessmentCacheService.js` — new. Transient
  token cache for `/compare`.
- `backend/services/assessmentPersistenceService.js` — new. Atomic
  submit-time persistence + phoneme stats.
- `backend/services/aiRuntimeService.js` — `compare(req)` replaced with
  a pure `assess({audioPath, referenceText, language})` passthrough (no
  persistence, no req/model dependencies).
- `backend/controllers/practiceController.js` — `+compare`,
  `submitPractice` rewritten to redeem the token and persist.
- `backend/controllers/aiRuntimeController.js`,
  `backend/routes/aiRuntimeRoutes.js` — `compare` removed (moved to
  `/api/practice/compare`).
- `backend/routes/practiceRoutes.js` — `+POST /compare`; `POST /` no
  longer takes a file upload.

### Frontend
- `frontend/src/services/practiceService.js` — `comparePractice` now
  calls `/practice/compare` (was `/ai-runtime/compare`); `submitPractice`
  now sends `{lesson_sentence_id, practice_attempt_id, assessment_token}`
  as JSON instead of re-uploading the recording.
- `frontend/src/features/practice/context/PracticePlayerProvider.jsx` —
  `+assessmentToken` state, threaded into `submitRecording`.
- `frontend/src/pages/mentee/PronunciationLoadingPage.jsx` — captures
  `response.assessment_token` from the compare call.

## Run / migrate

```bash
cd backend
npx sequelize-cli db:migrate
```

Both migrations are idempotent and additive. If the previous
`lesson_attempts` version was already applied, the second migration
drops it (empty table — this sprint's own addition, no real attempt
data lost either way).
