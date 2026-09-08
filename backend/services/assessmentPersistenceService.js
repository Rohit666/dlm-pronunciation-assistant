const {
  sequelize,
  Assessment,
  WordAssessment,
  PhonemeAssessment,
  Diagnosis,
  LearningNeed,
  AssessmentSnapshot,
  PracticeSession,
} = require("../models");
const practiceSessionTryService = require("./practiceSessionTryService");
const PRACTICE_SESSION_STATUSES = require("../constants/practiceSessionStatuses");

// Aggregates per-phoneme total/weak deltas out of this assessment's
// normalized per-word phoneme comparisons, then applies them as a
// single atomic upsert-per-phoneme inside the caller's transaction.
async function applyPhonemeStatsDeltas(menteeId, words, transaction) {
  const deltas = new Map();

  for (const word of words) {
    for (const phoneme of word.phonemes) {
      const symbol = phoneme.expected_symbol;
      if (!symbol) continue; // insertions have no expected phoneme

      const entry = deltas.get(symbol) || { total: 0, weak: 0 };
      entry.total += 1;
      if (phoneme.operation !== "exact_match") {
        entry.weak += 1;
      }
      deltas.set(symbol, entry);
    }
  }

  const now = new Date();
  for (const [symbol, delta] of deltas) {
    await sequelize.query(
      `INSERT INTO student_phoneme_stats
         (mentee_id, phoneme, total_attempts, weak_count, last_seen_at, created_at, updated_at)
       VALUES (:menteeId, :symbol, :total, :weak, :now, :now, :now)
       ON DUPLICATE KEY UPDATE
         total_attempts = total_attempts + VALUES(total_attempts),
         weak_count = weak_count + VALUES(weak_count),
         last_seen_at = VALUES(last_seen_at),
         updated_at = VALUES(updated_at)`,
      {
        replacements: { menteeId, symbol, total: delta.total, weak: delta.weak, now },
        transaction,
      },
    );
  }
}

/**
 * Persists one official submission as the accepted assessment for its
 * practice_session, atomically:
 *   - demotes the mentee's previous accepted assessment for the same
 *     lesson_sentence (is_accepted=false), if any
 *   - writes assessments / word_assessments / phoneme_assessments /
 *     diagnoses / learning_needs / assessment_snapshots
 *   - mirrors the score onto the legacy practice_sessions columns
 *   - upserts student_phoneme_stats
 *
 * Also guarantees (via practiceSessionTryService.ensureTryPersisted) that
 * the score being submitted has a practice_session_tries row, even if
 * the /compare call behind it was a regression that was correctly
 * dropped from the trajectory at the time.
 *
 * @param {object} params
 * @param {import("sequelize").Model} params.practiceSession
 * @param {number} params.menteeId
 * @param {number} params.lessonSentenceId
 * @param {ReturnType<import("../utils/assessmentAdapter").normalizeAssessmentPayload>} params.normalized
 * @param {string|null} params.recordingPath
 * @param {{overallScore: number, tryPersisted: boolean}} params.tryInfo
 */
async function persistAcceptedAssessment({
  practiceSession,
  menteeId,
  lessonSentenceId,
  normalized,
  recordingPath,
  tryInfo,
}) {
  return sequelize.transaction(async (transaction) => {
    // Improvement delta is computed against the mentee's prior
    // ACCEPTED submission for this sentence — intermediate,
    // never-persisted /compare tries are already excluded by
    // construction (they never reach this table).
    const priorAccepted = await Assessment.findOne({
      where: { is_accepted: true },
      include: [
        {
          model: PracticeSession,
          required: true,
          where: { mentee_id: menteeId, lesson_sentence_id: lessonSentenceId },
        },
      ],
      order: [["created_at", "DESC"]],
      transaction,
    });

    if (priorAccepted) {
      await priorAccepted.update({ is_accepted: false }, { transaction });
    }

    const assessment = await Assessment.create(
      {
        practice_session_id: practiceSession.id,
        ...normalized.assessment,
        is_accepted: true,
      },
      { transaction },
    );

    for (const word of normalized.words) {
      const wordRow = await WordAssessment.create(
        {
          assessment_id: assessment.id,
          word_index: word.word_index,
          expected_word: word.expected_word,
          detected_word: word.detected_word,
          operation: word.operation,
          accepted: word.accepted,
          confidence: word.confidence,
          accuracy: word.accuracy,
          weak_phonemes: word.weak_phonemes,
        },
        { transaction },
      );

      if (word.phonemes.length) {
        await PhonemeAssessment.bulkCreate(
          word.phonemes.map((phoneme) => ({
            word_assessment_id: wordRow.id,
            ...phoneme,
          })),
          { transaction },
        );
      }
    }

    if (normalized.diagnosis) {
      const diagnosisRow = await Diagnosis.create(
        {
          assessment_id: assessment.id,
          overall_accuracy: normalized.diagnosis.overall_accuracy,
          cefr_estimate: normalized.diagnosis.cefr_estimate,
          confidence: normalized.diagnosis.confidence,
          strengths: normalized.diagnosis.strengths,
        },
        { transaction },
      );

      if (normalized.diagnosis.needs.length) {
        await LearningNeed.bulkCreate(
          normalized.diagnosis.needs.map((need) => ({
            diagnosis_id: diagnosisRow.id,
            ...need,
          })),
          { transaction },
        );
      }
    }

    await AssessmentSnapshot.create(
      { assessment_id: assessment.id, ...normalized.snapshot },
      { transaction },
    );

    // Backward-compat mirror — anything still reading practice_sessions
    // directly (older mentor-review views) sees a real score/status.
    await practiceSession.update(
      {
        score: normalized.assessment.overall_accuracy,
        status: PRACTICE_SESSION_STATUSES.SUBMITTED,
        recording_path: recordingPath ?? practiceSession.recording_path,
      },
      { transaction },
    );

    // Progressive Attempt Logging: the accepted submission must always
    // have its own practice_session_tries row, even if this exact
    // /compare call was a regression that recordTryIfImprovement
    // correctly dropped at the time (e.g. the mentee submitted Try 3's
    // 30% instead of continuing to Try 4).
    await practiceSessionTryService.ensureTryPersisted({
      practiceSessionId: practiceSession.id,
      overallScore: tryInfo.overallScore,
      alreadyPersisted: tryInfo.tryPersisted,
      transaction,
    });

    await applyPhonemeStatsDeltas(menteeId, normalized.words, transaction);

    const delta = priorAccepted
      ? Number(assessment.overall_accuracy) - Number(priorAccepted.overall_accuracy)
      : null;

    return {
      assessment,
      previousAcceptedScore: priorAccepted
        ? Number(priorAccepted.overall_accuracy)
        : null,
      delta,
    };
  });
}

module.exports = { persistAcceptedAssessment };
