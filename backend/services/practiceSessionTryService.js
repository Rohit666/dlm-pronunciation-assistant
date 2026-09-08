const { sequelize, PracticeSession, PracticeSessionTry } = require("../models");
const PRACTICE_SESSION_STATUSES = require("../constants/practiceSessionStatuses");

// Finds the mentee's currently open practice_session for this
// (lesson_sentence, practice_attempt) tuple, or creates one. "Open"
// means status = STARTED — once a session is flipped to SUBMITTED it is
// never reopened; a later retry on the same sentence gets its own fresh
// session and its own try trajectory.
async function findOrCreateOpenSession({
  menteeId,
  lessonSentenceId,
  practiceAttemptId,
}) {
  const existing = await PracticeSession.findOne({
    where: {
      mentee_id: menteeId,
      lesson_sentence_id: lessonSentenceId,
      practice_attempt_id: practiceAttemptId,
      status: PRACTICE_SESSION_STATUSES.STARTED,
    },
    order: [["id", "DESC"]],
  });

  if (existing) {
    return existing;
  }

  return PracticeSession.create({
    mentee_id: menteeId,
    lesson_sentence_id: lessonSentenceId,
    practice_attempt_id: practiceAttemptId,
    status: PRACTICE_SESSION_STATUSES.STARTED,
  });
}

// Progressive Filter Rule: persists a practice_session_tries row only
// if overallScore strictly beats every score already logged for this
// session (Try 1: 40% -> keep [nothing to beat yet], Try 2: 50% -> keep,
// Try 3: 30% -> drop, Try 4: 60% -> keep). Runs its own transaction with
// a row lock on the last-known try so two racing /compare calls for the
// same session can't both "win" against a stale best-score read.
async function recordTryIfImprovement({ practiceSessionId, overallScore }) {
  return sequelize.transaction(async (transaction) => {
    const lastTry = await PracticeSessionTry.findOne({
      where: { practice_session_id: practiceSessionId },
      order: [["try_number", "DESC"]],
      lock: transaction.LOCK.UPDATE,
      transaction,
    });

    const bestScoreSoFar = lastTry ? Number(lastTry.overall_score) : null;
    const nextTryNumber = lastTry ? lastTry.try_number + 1 : 1;
    const isImprovement =
      bestScoreSoFar === null || Number(overallScore) > bestScoreSoFar;

    if (!isImprovement) {
      return { persisted: false, tryNumber: null, bestScoreSoFar };
    }

    await PracticeSessionTry.create(
      {
        practice_session_id: practiceSessionId,
        try_number: nextTryNumber,
        overall_score: overallScore,
      },
      { transaction },
    );

    return {
      persisted: true,
      tryNumber: nextTryNumber,
      bestScoreSoFar: Number(overallScore),
    };
  });
}

// Guarantees the score being submitted has a practice_session_tries row,
// even if the exact /compare call behind it was a regression that
// recordTryIfImprovement correctly dropped at the time (e.g. the mentee
// chose to submit Try 3's 30% instead of continuing to Try 4). The
// accepted submission must never be invisible to the trajectory table
// it's the terminus of. Runs inside the caller's own transaction — never
// opens its own, since it's always called from within
// assessmentPersistenceService's submit transaction.
async function ensureTryPersisted({
  practiceSessionId,
  overallScore,
  alreadyPersisted,
  transaction,
}) {
  if (alreadyPersisted) {
    return;
  }

  const lastTry = await PracticeSessionTry.findOne({
    where: { practice_session_id: practiceSessionId },
    order: [["try_number", "DESC"]],
    lock: transaction.LOCK.UPDATE,
    transaction,
  });

  await PracticeSessionTry.create(
    {
      practice_session_id: practiceSessionId,
      try_number: lastTry ? lastTry.try_number + 1 : 1,
      overall_score: overallScore,
    },
    { transaction },
  );
}

module.exports = {
  findOrCreateOpenSession,
  recordTryIfImprovement,
  ensureTryPersisted,
};
