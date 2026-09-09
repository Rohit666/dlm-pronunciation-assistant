const { sequelize, Sequelize, Batch, Mentee } = require("../models");
const { round2 } = require("../utils/numberUtils");

const { QueryTypes } = Sequelize;

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
// "Struggling" is defined per STUDENT, not per instance: a student
// counts as struggling on a phoneme only if THEIR average similarity
// on it (across every accepted assessment touching it) is below 0.6 —
// this is a nested aggregation (avg per mentee+phoneme, then a count
// across that), which is why it's one raw SQL query instead of a
// single-level Sequelize fn(AVG)/fn(COUNT) call.
async function getCohortHeatmap(mentorId, batchId) {
  const menteeIds = await resolveMenteeScope(mentorId, batchId);
  if (!menteeIds.length) {
    return [];
  }

  const rows = await sequelize.query(
    `SELECT 
  symbol,
  total_students,
  struggling_students,
  (struggling_students / total_students) AS struggle_rate
FROM (
  SELECT
    symbol,
    COUNT(*) AS total_students,
    SUM(CASE WHEN student_avg_similarity < 0.6 THEN 1 ELSE 0 END) AS struggling_students
  FROM (
    SELECT
      ps.mentee_id,
      pa.expected_symbol AS symbol,
      AVG(COALESCE(pa.similarity, 0)) AS student_avg_similarity
    FROM phoneme_assessments pa
    INNER JOIN word_assessments wa ON wa.id = pa.word_assessment_id
    INNER JOIN assessments a ON a.id = wa.assessment_id
    INNER JOIN practice_sessions ps ON ps.id = a.practice_session_id
    WHERE ps.mentee_id IN (:menteeIds) AND a.is_accepted = TRUE
      AND pa.expected_symbol IS NOT NULL
    GROUP BY ps.mentee_id, pa.expected_symbol
  ) per_student
  GROUP BY symbol
) grouped
ORDER BY struggle_rate DESC;`,
    { replacements: { menteeIds }, type: QueryTypes.SELECT },
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

module.exports = { getCohortHeatmap, getStudentTiers };
