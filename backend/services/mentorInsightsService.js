const { sequelize, Sequelize, Batch, Mentee } = require("../models");
const { round2 } = require("../utils/numberUtils");

const { QueryTypes } = Sequelize;

const CONFUSION_LIMIT = 10;

// Judgment call, disclosed: the old rule flagged a mentee as
// "struggling" on a phoneme when their AVG(similarity) on it fell below
// 0.6 — an arbitrary float cutoff on a synthetic score that no longer
// exists. Its discrete replacement is a miss-rate: the fraction of that
// mentee's attempts on the phoneme that were NOT an exact match
// (SUM(matched=FALSE)/COUNT(*)). 0.4 (missing more than 40% of
// attempts) is the chosen analogous cutoff — there's no way to derive
// an exact equivalent from the old threshold, since similarity and
// miss-rate are different quantities.
const STRUGGLE_MISS_RATE_THRESHOLD = 0.4;

// Shared scope resolver for both mentor insight endpoints. batch_id is
// optional — when given, ownership is verified (a mentor can only see
// their own batches); when omitted, every mentee across every batch
// this mentor owns is in scope, mirroring the existing pattern in
// services/analyticsService.js (getWeakStudents et al).
async function resolveMenteeScope(mentorId, batchId) {
  if (batchId) {
    const batch = await Batch.findOne({
      where: { id: batchId, mentor_id: mentorId },
    });
    if (!batch) {
      const error = new Error("Batch not found or not owned by this mentor.");
      error.statusCode = 404;
      throw error;
    }
    const mentees = await Mentee.findAll({
      where: { batch_id: batchId },
      attributes: ["id"],
    });
    return mentees.map((mentee) => mentee.id);
  }

  const batches = await Batch.findAll({
    where: { mentor_id: mentorId },
    attributes: ["id"],
  });
  const batchIds = batches.map((batch) => batch.id);
  if (!batchIds.length) {
    return [];
  }

  const mentees = await Mentee.findAll({
    where: { batch_id: batchIds },
    attributes: ["id"],
  });
  return mentees.map((mentee) => mentee.id);
}

// Milestone 6 — GET /api/analytics/mentor/cohort-heatmap
//
// Official Score vs Trajectory rule applies here too: every phoneme
// instance counted comes from an accepted (is_accepted = true)
// assessment — never a raw practice_session_tries row, which would let
// an abandoned/regressed try distort the class-wide picture.
//
// "Struggling" is still defined per STUDENT, not per instance — that
// nested-aggregation shape is unchanged (and required: PhonemeHeatmap.jsx
// renders totalStudents/strugglingStudents as "X/Y students", so this
// can't be flattened to raw instance counts). What changed is the
// per-student classification metric: instead of
// AVG(pa.similarity) < 0.6 (a synthetic scalar that no longer exists),
// a student now counts as struggling on a phoneme when their discrete
// miss-rate on it — SUM(matched=FALSE)/COUNT(*) — exceeds
// STRUGGLE_MISS_RATE_THRESHOLD. substitution_count/deletion_count are
// new: a flat per-symbol breakdown of how those misses split, joined in
// (not nested per-student — one substitution or deletion is one
// instance regardless of which mentee produced it).
//
// The outer ORDER BY previously divided two sibling aggregate aliases
// (struggling_students / total_students) directly in the ORDER BY
// clause — not portable across MySQL/MariaDB alias-resolution rules.
// struggle_rate is now materialized as its own column one level in
// (`base`), and the outermost query orders by that column directly.
async function getCohortHeatmap(mentorId, batchId) {
  const menteeIds = await resolveMenteeScope(mentorId, batchId);
  if (!menteeIds.length) {
    return [];
  }

  const rows = await sequelize.query(
    `SELECT
       base.symbol,
       base.total_students,
       base.struggling_students,
       base.substitution_count,
       base.deletion_count,
       base.struggle_rate
     FROM (
       SELECT
         per_student.symbol AS symbol,
         COUNT(*) AS total_students,
         SUM(CASE WHEN per_student.student_miss_rate > :missRateThreshold THEN 1 ELSE 0 END) AS struggling_students,
         counts.substitution_count AS substitution_count,
         counts.deletion_count AS deletion_count,
         SUM(CASE WHEN per_student.student_miss_rate > :missRateThreshold THEN 1 ELSE 0 END) / COUNT(*) AS struggle_rate
       FROM (
         SELECT
           ps.mentee_id,
           pa.expected_symbol AS symbol,
           SUM(CASE WHEN pa.matched = FALSE THEN 1 ELSE 0 END) / COUNT(*) AS student_miss_rate
         FROM phoneme_assessments pa
         INNER JOIN word_assessments wa ON wa.id = pa.word_assessment_id
         INNER JOIN assessments a ON a.id = wa.assessment_id
         INNER JOIN practice_sessions ps ON ps.id = a.practice_session_id
         WHERE ps.mentee_id IN (:menteeIds) AND a.is_accepted = TRUE
           AND pa.expected_symbol IS NOT NULL
         GROUP BY ps.mentee_id, pa.expected_symbol
       ) per_student
       INNER JOIN (
         SELECT
           pa.expected_symbol AS symbol,
           SUM(CASE WHEN pa.operation = 'substitution' THEN 1 ELSE 0 END) AS substitution_count,
           SUM(CASE WHEN pa.operation = 'deletion' THEN 1 ELSE 0 END) AS deletion_count
         FROM phoneme_assessments pa
         INNER JOIN word_assessments wa ON wa.id = pa.word_assessment_id
         INNER JOIN assessments a ON a.id = wa.assessment_id
         INNER JOIN practice_sessions ps ON ps.id = a.practice_session_id
         WHERE ps.mentee_id IN (:menteeIds) AND a.is_accepted = TRUE
           AND pa.expected_symbol IS NOT NULL
         GROUP BY pa.expected_symbol
       ) counts ON counts.symbol = per_student.symbol
       GROUP BY per_student.symbol, counts.substitution_count, counts.deletion_count
     ) base
     ORDER BY base.struggle_rate DESC`,
    {
      replacements: { menteeIds, missRateThreshold: STRUGGLE_MISS_RATE_THRESHOLD },
      type: QueryTypes.SELECT,
    },
  );

  return rows.map((row) => {
    const totalStudents = Number(row.total_students);
    const strugglingStudents = Number(row.struggling_students);
    return {
      symbol: row.symbol,
      totalStudents,
      strugglingStudents,
      struggleRate: totalStudents
        ? Math.round((strugglingStudents / totalStudents) * 100)
        : 0,
      substitutionCount: Number(row.substitution_count || 0),
      deletionCount: Number(row.deletion_count || 0),
    };
  });
}

// Milestone 6 — GET /api/analytics/mentor/student-tiers
//
// Returns a FLAT per-student list — tier bucketing (Strong >=80% /
// Moderate 60-79.99% / Needs Attention <60%) stays a client-side
// concern via the existing frontend/src/utils/studentTiering.js, which
// already implements these exact thresholds. Keeping the boundary rule
// in one place (not duplicated server + client) is the point; this
// endpoint's job is only to compute avgScore per student off the
// official submitted assessment.
async function getStudentTiers(mentorId, batchId) {
  const menteeIds = await resolveMenteeScope(mentorId, batchId);
  if (!menteeIds.length) {
    return [];
  }

  const rows = await sequelize.query(
    `SELECT
       m.id,
       u.name,
       u.email,
       AVG(a.overall_accuracy) AS avg_score,
       COUNT(DISTINCT a.id) AS attempts,
       AVG(t.tries_count) AS avg_retries_per_sentence
     FROM mentees m
     INNER JOIN users u ON u.id = m.user_id
     LEFT JOIN practice_sessions ps ON ps.mentee_id = m.id
     LEFT JOIN assessments a ON a.practice_session_id = ps.id AND a.is_accepted = TRUE
     LEFT JOIN (
       SELECT practice_session_id, COUNT(*) AS tries_count
       FROM practice_session_tries
       GROUP BY practice_session_id
     ) t ON t.practice_session_id = a.practice_session_id
     WHERE m.id IN (:menteeIds)
     GROUP BY m.id, u.name, u.email`,
    { replacements: { menteeIds }, type: QueryTypes.SELECT },
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    // A student with zero accepted submissions has no evidence of
    // mastery yet — 0, not null, so StudentTierBoard never renders
    // "null%" and the student correctly lands in Needs Attention.
    avgScore: round2(row.avg_score) ?? 0,
    attempts: Number(row.attempts || 0),
    avgRetriesPerSentence: round2(row.avg_retries_per_sentence),
  }));
}

// New — Phoneme Diagnostics & Confusion Frequency. No prior endpoint
// existed for this (mentorInsightsController.js only wired
// getCohortHeatmap/getStudentTiers); this function is delivered as
// asked, wiring a controller/route is offered as a follow-up. Discrete
// evidence only, same scoping convention (resolveMenteeScope) as the
// two functions above.
async function getPhonemeConfusionFrequency(mentorId, batchId) {
  const menteeIds = await resolveMenteeScope(mentorId, batchId);
  if (!menteeIds.length) {
    return { substitutions: [], deletions: [], exactMatchRate: 0 };
  }

  const scopeClause = `
     FROM phoneme_assessments pa
     INNER JOIN word_assessments wa ON wa.id = pa.word_assessment_id
     INNER JOIN assessments a ON a.id = wa.assessment_id
     INNER JOIN practice_sessions ps ON ps.id = a.practice_session_id
     WHERE ps.mentee_id IN (:menteeIds) AND a.is_accepted = TRUE`;

  const substitutions = await sequelize.query(
    `SELECT pa.expected_symbol, pa.detected_symbol, COUNT(*) AS occurrences
     ${scopeClause}
       AND pa.operation = 'substitution' AND pa.expected_symbol IS NOT NULL
     GROUP BY pa.expected_symbol, pa.detected_symbol
     ORDER BY occurrences DESC
     LIMIT :limit`,
    { replacements: { menteeIds, limit: CONFUSION_LIMIT }, type: QueryTypes.SELECT },
  );

  const deletions = await sequelize.query(
    `SELECT pa.expected_symbol, COUNT(*) AS occurrences
     ${scopeClause}
       AND pa.operation = 'deletion' AND pa.expected_symbol IS NOT NULL
     GROUP BY pa.expected_symbol
     ORDER BY occurrences DESC
     LIMIT :limit`,
    { replacements: { menteeIds, limit: CONFUSION_LIMIT }, type: QueryTypes.SELECT },
  );

  const [exactMatchRow] = await sequelize.query(
    `SELECT
       SUM(CASE WHEN pa.matched = TRUE THEN 1 ELSE 0 END) AS exact_matches,
       COUNT(*) AS total
     ${scopeClause}
       AND pa.expected_symbol IS NOT NULL`,
    { replacements: { menteeIds }, type: QueryTypes.SELECT },
  );

  const total = Number(exactMatchRow?.total || 0);
  const exactMatches = Number(exactMatchRow?.exact_matches || 0);

  return {
    substitutions: substitutions.map((row) => ({
      expectedSymbol: row.expected_symbol,
      detectedSymbol: row.detected_symbol,
      occurrences: Number(row.occurrences),
    })),
    deletions: deletions.map((row) => ({
      expectedSymbol: row.expected_symbol,
      occurrences: Number(row.occurrences),
    })),
    exactMatchRate: total ? Math.round((exactMatches / total) * 100) : 0,
  };
}

module.exports = { getCohortHeatmap, getStudentTiers, getPhonemeConfusionFrequency };
