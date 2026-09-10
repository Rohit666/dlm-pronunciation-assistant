const { sequelize, Sequelize } = require("../models");
const { round2 } = require("../utils/numberUtils");

const { QueryTypes } = Sequelize;

const RECENT_SESSIONS_LIMIT = 10;
const WEAKEST_PHONEMES_LIMIT = 10;
const SUBSTITUTION_LIMIT = 10;
const TRAJECTORY_SESSIONS_LIMIT = 8; // within the requested 5-10 range

// Milestone 5 — GET /api/analytics/mentee/overview
//
// Official Score vs Trajectory rule: every aggregate here is keyed off
// assessments.is_accepted = true (the mentee's authoritative submitted
// grade for that sentence) joined through practice_sessions.mentee_id —
// never off practice_session_tries alone, which would let an abandoned
// or superseded try skew the numbers. All aggregation runs in MySQL
// (GROUP BY / AVG / SUM / COUNT) — no table is loaded into Node memory.
async function getMenteeOverview(menteeId) {
  const [sessionCounts] = await sequelize.query(
    `SELECT
       COUNT(DISTINCT ps.lesson_sentence_id) AS total_sentences_practiced,
       SUM(CASE WHEN ps.status = 'submitted' THEN 1 ELSE 0 END) AS sessions_completed
     FROM practice_sessions ps
     WHERE ps.mentee_id = :menteeId`,
    { replacements: { menteeId }, type: QueryTypes.SELECT },
  );

  // average_attempts_to_mastery: per accepted session, how many
  // practice_session_tries rows it took to get there (the Progressive
  // Filter Rule already means every row here is a real improving try,
  // never a regressed one), averaged across all the mentee's accepted
  // sessions.
  const [accuracy] = await sequelize.query(
    `SELECT
       AVG(a.overall_accuracy) AS average_submitted_accuracy,
       SUM(a.substitutions) AS substitutions,
       SUM(a.insertions) AS insertions,
       SUM(a.deletions) AS deletions,
       SUM(a.exact_matches) AS exact_matches,
       SUM(a.total_reference) AS total_reference,
       AVG(t.tries_count) AS average_attempts_to_mastery
     FROM assessments a
     INNER JOIN practice_sessions ps ON ps.id = a.practice_session_id
     LEFT JOIN (
       SELECT practice_session_id, COUNT(*) AS tries_count
       FROM practice_session_tries
       GROUP BY practice_session_id
     ) t ON t.practice_session_id = a.practice_session_id
     WHERE ps.mentee_id = :menteeId AND a.is_accepted = TRUE`,
    { replacements: { menteeId }, type: QueryTypes.SELECT },
  );

  // Rule 1 (Official Score vs Trajectory) worked example, made concrete:
  // submitted_score is the authoritative grade; peak_score/
  // first_try_score/mastery_delta are trajectory context alongside it,
  // never a substitute. Capped to the most recent accepted sessions —
  // this is display/detail data, not the aggregate above.
  const recentRows = await sequelize.query(
    `SELECT
       ps.lesson_sentence_id,
       a.overall_accuracy AS submitted_score,
       a.created_at AS submitted_at,
       peak.peak_score,
       peak.tries_count,
       first_try.first_try_score
     FROM assessments a
     INNER JOIN practice_sessions ps ON ps.id = a.practice_session_id
     LEFT JOIN (
       SELECT practice_session_id, MAX(overall_score) AS peak_score, COUNT(*) AS tries_count
       FROM practice_session_tries
       GROUP BY practice_session_id
     ) peak ON peak.practice_session_id = a.practice_session_id
     LEFT JOIN (
       SELECT practice_session_id, overall_score AS first_try_score
       FROM practice_session_tries
       WHERE try_number = 1
     ) first_try ON first_try.practice_session_id = a.practice_session_id
     WHERE ps.mentee_id = :menteeId AND a.is_accepted = TRUE
     ORDER BY a.created_at DESC
     LIMIT :limit`,
    {
      replacements: { menteeId, limit: RECENT_SESSIONS_LIMIT },
      type: QueryTypes.SELECT,
    },
  );

  return {
    totalSentencesPracticed: Number(sessionCounts?.total_sentences_practiced || 0),
    sessionsCompleted: Number(sessionCounts?.sessions_completed || 0),
    averageSubmittedAccuracy: round2(accuracy?.average_submitted_accuracy),
    averageAttemptsToMastery: round2(accuracy?.average_attempts_to_mastery),
    accuracyBreakdown: {
      substitutions: Number(accuracy?.substitutions || 0),
      insertions: Number(accuracy?.insertions || 0),
      deletions: Number(accuracy?.deletions || 0),
      exactMatches: Number(accuracy?.exact_matches || 0),
      totalReference: Number(accuracy?.total_reference || 0),
    },
    recentSessions: recentRows.map((row) => {
      const submittedScore = round2(row.submitted_score);
      const firstTryScore = round2(row.first_try_score);
      return {
        lessonSentenceId: row.lesson_sentence_id,
        submittedAt: row.submitted_at,
        submittedScore,
        peakScore: round2(row.peak_score),
        firstTryScore,
        // null when a first-try row is somehow missing rather than 0 —
        // 0 would misreport "no improvement" instead of "no data".
        masteryDelta:
          submittedScore !== null && firstTryScore !== null
            ? round2(submittedScore - firstTryScore)
            : null,
        triesCount: Number(row.tries_count || 0),
      };
    }),
  };
}

// Milestone 5 — GET /api/analytics/mentee/phonemes
//
// Blast-radius fix (found while removing `similarity` from
// phoneme_assessments, not part of the schema-correction's stated file
// list, but left in would break this query at runtime with
// "Unknown column 'pa.similarity'"): weakestPhonemes previously ranked
// by AVG(pa.similarity) ASC. error_rate was already discrete
// (operation <> 'exact_match') and needed no change; it's now also the
// ordering column — "weakest first" is unchanged, just driven by the
// error rate instead of a synthetic similarity average. .symbol and
// .errorRate are the only fields recommendationService.js and
// menteeDashboardController.js consume — both preserved exactly.
async function getMenteePhonemes(menteeId) {
  const weakestPhonemes = await sequelize.query(
    `SELECT
       pa.expected_symbol,
       AVG(CASE WHEN pa.operation <> 'exact_match' THEN 1 ELSE 0 END) * 100 AS error_rate,
       COUNT(*) AS occurrences
     FROM phoneme_assessments pa
     INNER JOIN word_assessments wa ON wa.id = pa.word_assessment_id
     INNER JOIN assessments a ON a.id = wa.assessment_id
     INNER JOIN practice_sessions ps ON ps.id = a.practice_session_id
     WHERE ps.mentee_id = :menteeId AND a.is_accepted = TRUE
       AND pa.expected_symbol IS NOT NULL
     GROUP BY pa.expected_symbol
     ORDER BY error_rate DESC
     LIMIT :limit`,
    {
      replacements: { menteeId, limit: WEAKEST_PHONEMES_LIMIT },
      type: QueryTypes.SELECT,
    },
  );

  const commonSubstitutions = await sequelize.query(
    `SELECT
       pa.expected_symbol,
       pa.detected_symbol,
       COUNT(*) AS occurrences
     FROM phoneme_assessments pa
     INNER JOIN word_assessments wa ON wa.id = pa.word_assessment_id
     INNER JOIN assessments a ON a.id = wa.assessment_id
     INNER JOIN practice_sessions ps ON ps.id = a.practice_session_id
     WHERE ps.mentee_id = :menteeId AND a.is_accepted = TRUE
       AND pa.operation = 'substitution' AND pa.expected_symbol IS NOT NULL
     GROUP BY pa.expected_symbol, pa.detected_symbol
     ORDER BY occurrences DESC
     LIMIT :limit`,
    {
      replacements: { menteeId, limit: SUBSTITUTION_LIMIT },
      type: QueryTypes.SELECT,
    },
  );

  // One point per submitted session (not per phoneme instance) — the
  // mentee's overall phoneme accuracy for that session, chronological.
  // Same blast-radius fix as weakestPhonemes above: AVG(pa.similarity)
  // replaced with a discrete exact-match rate
  // (SUM(matched=TRUE)/COUNT(*) * 100) — same 0-100 scale a similarity
  // average produced, so the trend line's shape is preserved even
  // though the underlying metric is now discrete.
  const trajectoryRows = await sequelize.query(
    `SELECT
       a.id AS assessment_id,
       a.created_at AS submitted_at,
       SUM(CASE WHEN pa.matched = TRUE THEN 1 ELSE 0 END) / COUNT(*) * 100 AS exact_match_rate
     FROM assessments a
     INNER JOIN practice_sessions ps ON ps.id = a.practice_session_id
     INNER JOIN word_assessments wa ON wa.assessment_id = a.id
     INNER JOIN phoneme_assessments pa
       ON pa.word_assessment_id = wa.id AND pa.expected_symbol IS NOT NULL
     WHERE ps.mentee_id = :menteeId AND a.is_accepted = TRUE
     GROUP BY a.id, a.created_at
     ORDER BY a.created_at DESC
     LIMIT :limit`,
    {
      replacements: { menteeId, limit: TRAJECTORY_SESSIONS_LIMIT },
      type: QueryTypes.SELECT,
    },
  );

  return {
    weakestPhonemes: weakestPhonemes.map((row) => ({
      symbol: row.expected_symbol,
      errorRate: round2(row.error_rate),
      occurrences: Number(row.occurrences),
    })),
    commonSubstitutions: commonSubstitutions.map((row) => ({
      expectedSymbol: row.expected_symbol,
      detectedSymbol: row.detected_symbol,
      occurrences: Number(row.occurrences),
    })),
    // Chronological ascending — a trend line reads left-to-right as
    // "oldest to most recent", the query above fetches newest-first
    // only to apply the LIMIT to the right end of the window.
    trajectory: trajectoryRows
      .slice()
      .reverse()
      .map((row) => ({
        assessmentId: row.assessment_id,
        submittedAt: row.submitted_at,
        exactMatchRate: round2(row.exact_match_rate),
      })),
  };
}

module.exports = { getMenteeOverview, getMenteePhonemes };
