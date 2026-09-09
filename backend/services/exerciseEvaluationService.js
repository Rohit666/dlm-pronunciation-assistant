const { sequelize, LessonExercise, ExerciseQuestion, ExerciseAttempt, ExerciseAttemptAnswer } =
  require("../models");
const QUESTION_TYPES = require("../constants/exerciseQuestionTypes");

// ---------------------------------------------------------------------
// Payload contracts (JSON columns — documented here since the schema
// itself is untyped):
//
// mcq / true_false:
//   content_payload: { options: [{ id: string, label: string }] }
//   grading_rubric:  { correct_option_id: string, explanation?: string }
//   student_answer:  string  (selected option id)
//
// fill_blank:
//   content_payload: { text_with_blank?: string }
//   grading_rubric:  { acceptable_answers: string[], explanation?: string }
//   student_answer:  string
//
// sentence_formation:
//   content_payload: { tokens: [{ id: string, text: string }] }  // shuffled display order
//   grading_rubric:  { expected_order: string[], explanation?: string } // token ids, correct order
//   student_answer:  string[]  (token ids in the order the mentee arranged them)
//
// comprehension / paragraph:
//   content_payload: { passage?: string }
//   grading_rubric:  { keywords: string[], min_word_count?: number, model_answer?: string }
//   student_answer:  string  (free text)
// ---------------------------------------------------------------------

function normalizeText(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function gradeChoiceQuestion(question, studentAnswer) {
  const rubric = question.grading_rubric || {};
  const isCorrect =
    studentAnswer !== null &&
    studentAnswer !== undefined &&
    String(studentAnswer) === String(rubric.correct_option_id);

  const options = question.content_payload?.options || [];
  const correctOption = options.find(
    (option) => String(option.id) === String(rubric.correct_option_id),
  );

  return {
    isCorrect,
    scoreAwarded: isCorrect ? question.points : 0,
    feedback:
      rubric.explanation ||
      (correctOption ? `Correct answer: ${correctOption.label}` : ""),
  };
}

function gradeFillBlank(question, studentAnswer) {
  const rubric = question.grading_rubric || {};
  const acceptable = (rubric.acceptable_answers || []).map(normalizeText);
  const isCorrect = acceptable.includes(normalizeText(studentAnswer));

  return {
    isCorrect,
    scoreAwarded: isCorrect ? question.points : 0,
    feedback:
      rubric.explanation ||
      (rubric.acceptable_answers?.length
        ? `Accepted answers: ${rubric.acceptable_answers.join(", ")}`
        : ""),
  };
}

function gradeSentenceFormation(question, studentAnswer) {
  const rubric = question.grading_rubric || {};
  const expected = rubric.expected_order || [];
  const submitted = Array.isArray(studentAnswer) ? studentAnswer : [];
  const isCorrect =
    expected.length > 0 &&
    expected.length === submitted.length &&
    expected.every((tokenId, index) => String(tokenId) === String(submitted[index]));

  const tokensById = new Map(
    (question.content_payload?.tokens || []).map((token) => [String(token.id), token.text]),
  );
  const correctSentence = expected.map((id) => tokensById.get(String(id)) || "?").join(" ");

  return {
    isCorrect,
    scoreAwarded: isCorrect ? question.points : 0,
    feedback: rubric.explanation || (correctSentence ? `Correct order: "${correctSentence}"` : ""),
  };
}

// Heuristic keyword/length matcher — deliberately NOT full NLP grading.
// Structured so Milestone 10 can swap this function's body for a call
// into the local Python AI runtime without touching the caller
// (gradeAnswer / submitExerciseAttempt below never need to change).
function gradeOpenResponse(question, studentAnswer) {
  const rubric = question.grading_rubric || {};
  const keywords = rubric.keywords || [];
  const minWordCount = rubric.min_word_count || 0;
  const text = typeof studentAnswer === "string" ? studentAnswer : "";
  const normalized = normalizeText(text);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const matchedKeywords = keywords.filter((keyword) =>
    normalized.includes(normalizeText(keyword)),
  );
  const keywordRatio = keywords.length ? matchedKeywords.length / keywords.length : 1;
  const meetsLength = wordCount >= minWordCount;

  // Partial credit: proportional to keyword coverage, zeroed out if the
  // response is shorter than the minimum expected length (a one-word
  // answer that happens to contain a keyword isn't a real response).
  const scoreAwarded = meetsLength
    ? Math.round(keywordRatio * question.points * 100) / 100
    : 0;
  const isCorrect = meetsLength && keywordRatio >= 0.6;

  const feedbackParts = [];
  if (!meetsLength) {
    feedbackParts.push(`Response is shorter than the expected minimum (${minWordCount} words).`);
  }
  if (keywords.length) {
    feedbackParts.push(
      `Covered ${matchedKeywords.length}/${keywords.length} expected keywords.`,
    );
  }
  if (rubric.model_answer) {
    feedbackParts.push(`Model answer: ${rubric.model_answer}`);
  }

  return { isCorrect, scoreAwarded, feedback: feedbackParts.join(" ") };
}

// Single dispatch point — the only place question_type is switched on.
function gradeAnswer(question, studentAnswer) {
  switch (question.question_type) {
    case QUESTION_TYPES.MCQ:
    case QUESTION_TYPES.TRUE_FALSE:
      return gradeChoiceQuestion(question, studentAnswer);
    case QUESTION_TYPES.FILL_BLANK:
      return gradeFillBlank(question, studentAnswer);
    case QUESTION_TYPES.SENTENCE_FORMATION:
      return gradeSentenceFormation(question, studentAnswer);
    case QUESTION_TYPES.COMPREHENSION:
    case QUESTION_TYPES.PARAGRAPH:
      return gradeOpenResponse(question, studentAnswer);
    default:
      // Unknown type — never silently pass; a mis-tagged question should
      // surface as a zero, not a false pass.
      return { isCorrect: false, scoreAwarded: 0, feedback: "Unrecognized question type." };
  }
}

// Atomically grades a full submission, persists the attempt + every
// per-question answer, and returns the answer sheet (question prompts,
// student choices, correct answers via the grading_rubric already loaded,
// and feedback) — this IS the one place grading_rubric is allowed to
// reach the response, since the attempt is already submitted and graded.
//
// answers: [{ questionId, studentAnswer }]
async function submitExerciseAttempt({ exerciseId, menteeId, answers }) {
  return sequelize.transaction(async (transaction) => {
    const exercise = await LessonExercise.findByPk(exerciseId, { transaction });
    if (!exercise) {
      throw new Error("Exercise not found");
    }

    const questions = await ExerciseQuestion.findAll({
      where: { exercise_id: exerciseId },
      order: [["order_index", "ASC"]],
      transaction,
    });

    const answerByQuestionId = new Map(
      answers.map((answer) => [String(answer.questionId), answer.studentAnswer]),
    );

    const lastAttempt = await ExerciseAttempt.findOne({
      where: { exercise_id: exerciseId, mentee_id: menteeId },
      order: [["attempt_number", "DESC"]],
      lock: transaction.LOCK.UPDATE,
      transaction,
    });
    const attemptNumber = lastAttempt ? lastAttempt.attempt_number + 1 : 1;

    let totalScore = 0;
    let maxScore = 0;
    const answerSheet = [];

    for (const question of questions) {
      const studentAnswer = answerByQuestionId.get(String(question.id)) ?? null;
      const { isCorrect, scoreAwarded, feedback } = gradeAnswer(question, studentAnswer);

      totalScore += scoreAwarded;
      maxScore += question.points;

      answerSheet.push({
        questionId: question.id,
        questionType: question.question_type,
        prompt: question.prompt,
        contentPayload: question.content_payload,
        gradingRubric: question.grading_rubric,
        points: question.points,
        studentAnswer,
        isCorrect,
        scoreAwarded,
        feedback,
      });
    }

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 10000) / 100 : 0;
    const passed = percentage >= Number(exercise.passing_percentage);

    const attempt = await ExerciseAttempt.create(
      {
        exercise_id: exerciseId,
        mentee_id: menteeId,
        attempt_number: attemptNumber,
        total_score: totalScore,
        max_score: maxScore,
        percentage,
        passed,
        submitted_at: new Date(),
      },
      { transaction },
    );

    if (answerSheet.length) {
      await ExerciseAttemptAnswer.bulkCreate(
        answerSheet.map((entry) => ({
          exercise_attempt_id: attempt.id,
          question_id: entry.questionId,
          student_answer: entry.studentAnswer,
          is_correct: entry.isCorrect,
          score_awarded: entry.scoreAwarded,
          feedback: entry.feedback,
        })),
        { transaction },
      );
    }

    return {
      attempt: {
        id: attempt.id,
        attemptNumber,
        totalScore,
        maxScore,
        percentage,
        passed,
        submittedAt: attempt.submitted_at,
        passingPercentage: Number(exercise.passing_percentage),
      },
      answerSheet,
    };
  });
}

module.exports = {
  gradeAnswer,
  submitExerciseAttempt,
};
