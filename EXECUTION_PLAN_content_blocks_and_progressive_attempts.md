# Execution Plan — Content Builder + Progressive Attempt Persistence

Scope: Part 1 (dynamic sentence content builder) and Part 2 (progressive
attempt persistence) are fully implemented below, migration included.
Part 3 (mock → live cutover) is scoped and contracted but intentionally
**not** implemented yet — see "Part 3" section for why.

## Key findings from the real codebase (not assumptions)

1. **`practice_sessions` is not the right table for Part 2.** It already
   has `mentee_id` / `lesson_sentence_id` / `practice_attempt_id` /
   `score`, but it's the *manual mentor-review* flow: one row is
   created unconditionally per recording submit
   (`practiceController.submitPractice`), with no score, scored later
   by a human (`mentorReviewController.saveAttemptReview`). The
   AI-scored live-feedback flow (`aiRuntimeService.compare`, hit from
   the practice recorder) currently persists **nothing at all**. These
   are two independent flows today. The new `lesson_attempts` table is
   for the second one — it is not a duplicate of `practice_sessions`.

2. **ai-runtime does not compute `fluency_score` or `completeness_score`
   today.** Confirmed by reading
   `pronunciation_scoring_engine.py`, `pronunciation_statistics_engine.py`,
   `word_assessment.py`, `sentence_assessment.py`, and grepping the
   whole `ai-runtime/app` tree for "fluency"/"completeness" — the only
   metric produced anywhere is phoneme-level exact-match accuracy
   (`PronunciationAssessment.overall_accuracy`). `lesson_attempts` has
   real, nullable `fluency_score` / `completeness_score` columns so no
   further migration is needed once ai-runtime grows those engines, but
   right now both are persisted as `NULL` and `overall_score` /
   `accuracy_score` are the same value. Flagging this now rather than
   inventing fake numbers.

3. **`aiRuntimeService.compare()`'s only reference-text source is
   `lessonSentence.sentence_text`.** Part 1 keeps this column in sync
   with the new `content_blocks` main_text block on every create/update
   (`backend/utils/sentenceBlocks.js#deriveLegacyColumns`), so AI
   scoring keeps working unmodified.

## Part 1 — Content Blocks: JSON column, not a relational table

Chose `lesson_sentences.content_blocks` (`JSON` column) over a
`lesson_sentence_blocks` table. Reasoning:

- Precedent already in this schema: `lessons.lesson_outcomes` and
  `lessons.target_skills` are both `DataTypes.JSON` (LONGTEXT +
  `CHECK(json_valid(...))` on MariaDB), read/written as a whole blob,
  never queried by SQL predicate on their internals. `content_blocks`
  has the exact same access pattern — the mentor UI loads/saves the
  whole array per sentence, nothing ever needs
  `WHERE content_blocks->attachments->type = 'audio'`.
- A relational table buys indexable/queryable sub-rows, which nothing
  in this SRS needs, at the cost of 2 extra joins (blocks +
  attachments) on every sentence read, plus reorder logic that has to
  live in the DB instead of a plain `order` field in the array.
- Legacy columns (`sentence_text`, `audio_path`, `image_path`,
  `video_path`) are **kept**, not dropped, and backfilled into
  `content_blocks` for every existing row in the same migration, then
  kept in sync going forward — additive, reversible, no data loss.

## Part 2 — Progressive Filter Rule, exact algorithm

Implemented in `backend/services/lessonAttemptService.js`, called from
`aiRuntimeService.compare()` right after the ai-runtime response comes
back.

For a given `(lesson_sentence_id, mentee_id, practice_attempt_id)`
tuple:

- `bestScoreSoFar` = max `overall_score` among already-persisted
  (kept) attempts for that tuple, or `null` if none yet.
- A non-submission try is persisted only if `overall_score >
  bestScoreSoFar` (or it's the first try). This reproduces the spec's
  worked example exactly: 40 (kept, first) → 50 (kept, 50>40) → 30
  (dropped, 30<50) → 60 (kept, 60>50). Trajectory ends up 40, 50, 60.
- A submission (`is_submission=true` on the request) **always**
  persists, regardless of the filter — the student's deliberate final
  choice — and demotes any previously-submitted row for the same tuple
  first (transactionally), so exactly one `is_submitted=true` row
  exists per tuple at a time.
- `attempt_number` on the stored row is the position in the kept
  trajectory (1, 2, 3 for 40/50/60) — this alone gives retry count
  (`COUNT(*)`) and mastery delta (`last.overall_score -
  first.overall_score`) for analytics without a separate raw-try
  counter, since the spec only asks the *stored* progression to
  support that math.
- `student_phoneme_stats` is upserted in the **same transaction** as
  the `lesson_attempts` insert, via a single atomic
  `INSERT ... ON DUPLICATE KEY UPDATE` per distinct phoneme touched in
  that attempt (aggregated from `assessment_document.pronunciation
  .phoneme_comparison.steps`: every step with an `expected` phoneme
  increments `total_attempts`; `substitution`/`deletion` steps also
  increment `weak_count`).

## Files changed

### Migration (run this first)
- `backend/migrations/20260907090000-content-blocks-and-progressive-attempts.js`
  — additive, idempotent, transaction-wrapped. Adds
  `lesson_sentences.content_blocks` (+ backfill), creates
  `lesson_attempts`, creates `student_phoneme_stats`.
- `backend/.sequelizerc`, `backend/config/config.js` — did not exist in
  the repo (confirmed: `backend/migrations` was absent on a fresh
  clone), needed for `npx sequelize-cli db:migrate` to run at all.

### Backend — models
- `backend/models/LessonSentence.js` — `+content_blocks` field,
  `+hasMany LessonAttempt` association.
- `backend/models/LessonAttempt.js` — new.
- `backend/models/StudentPhonemeStat.js` — new.
- `backend/models/index.js` — registers the two new models.
- `backend/models/Mentee.js` — `+hasMany LessonAttempt`,
  `+hasMany StudentPhonemeStat`.

### Backend — Part 1 (content builder)
- `backend/utils/sentenceBlocks.js` — new. Shared
  validate/normalize/derive-legacy-columns logic.
- `backend/middleware/uploadMiddleware.js` — `+` dynamic destination
  routing for `block_<i>_attachment_<j>` fieldnames (by MIME type,
  since block count/attachment count is unbounded). Existing named
  fields (`thumbnail`, `audio`, `sentence_audio`, ...) untouched.
- `backend/routes/lessonSentenceRoutes.js` — `POST /:lessonId` and
  `PUT /:id` switched from `upload.fields([...])` (fixed field list)
  to `upload.any()` (block count is dynamic).
- `backend/controllers/lessonSentenceController.js` — `createSentence`
  / `updateSentence` rewritten: parse `content_blocks` JSON from the
  form, resolve each attachment's uploaded file or kept
  `existing_file_path`, validate, derive + write the legacy columns
  alongside `content_blocks`.

### Backend — Part 2 (progressive persistence)
- `backend/services/lessonAttemptService.js` — new. Progressive filter
  + transactional phoneme-stats upsert (see above).
- `backend/services/aiRuntimeService.js` — `compare()` now looks up the
  mentee, calls `lessonAttemptService.persistAttempt(...)` after the AI
  response, returns `{ ...aiResponseData, persistence }` so the
  frontend can show e.g. "not saved — below your best (60%)" without a
  second request.
- `backend/controllers/aiRuntimeController.js` — unchanged (already
  passes the service's return value straight through as `result`).

### Frontend — Part 1 (content builder)
- `frontend/src/utils/sentenceBlocks.js` — new. Mirrors the backend
  block shape; `appendBlocksToFormData` builds the indexed multipart
  fields the backend expects.
- `frontend/src/components/mentor/SentenceBlockBuilder.jsx` — new.
  Controlled block-builder: Main Text (fixed first) + N Sub-Text
  blocks, each with 3 attachment slots (audio/image/video), Add
  Sub-Text, remove, Move Up/Down (sub-text blocks only).
- `frontend/src/pages/mentor/LessonDetailPage.jsx` — static
  text-field-plus-3-file-pickers form replaced with
  `<SentenceBlockBuilder>` in both the "Add Sentence" panel and the
  "Edit Sentence" modal.

## Run / migrate

```bash
cd backend
npx sequelize-cli db:migrate
```

Idempotent — safe to run against the already-reconciled DB from the
previous schema-audit migration. Existing sentences get a
`content_blocks` main_text block backfilled from their current
`sentence_text`/`audio_path`/`image_path`/`video_path` automatically;
nothing needs to be re-entered.

No frontend dependency changes — the block builder reuses plain
controlled inputs (no new npm packages).

## Part 3 — deliberately not implemented yet

The spec itself gates Part 3 on "once Parts 1 and 2 are functional."
Concretely: every one of the "proposed" endpoints already named as
comments in `menteeInsightsService.js` / `mentorInsightsService.js`
(`/mentee-dashboard/carousels`, `/mentee-dashboard/milestones`,
`/mentee-dashboard/score-overview`, `/mentee-dashboard/attempt-trajectory`,
`/analytics/phoneme-heatmap`, `/analytics/student-tiers`,
`/analytics/attempt-trajectory`) is an aggregation query against
`lesson_attempts` / `student_phoneme_stats` — tables that don't exist
in the live DB until this migration runs and starts collecting real
attempts. Writing those queries now, before there's a single real row
to validate them against, repeats the exact mistake this project
already hit once (the pre-dump schema migration that guessed wrong and
had to be thrown out). Once the migration is run and a handful of real
practice attempts have flowed through Part 2:

- New `backend/controllers/insightsController.js` +
  `backend/routes/insightsRoutes.js` exposing the 7 endpoints above,
  each a Sequelize aggregation over `lesson_attempts` /
  `student_phoneme_stats` (joined to `mentees`/`users`/`lessons` for
  names and CEFR levels).
- `frontend/src/services/menteeInsightsService.js` /
  `mentorInsightsService.js` — swap each mock `resolve(...)` body for
  `api.get(...)` to the matching endpoint. No caller changes needed:
  both files' return shapes are already the final contract (the
  comments say so).

Say the word once Part 1/2 are migrated and have real attempts in the
DB, and Part 3 is a fast, low-risk follow-up.
