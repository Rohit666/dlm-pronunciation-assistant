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
// paragraph:
//   content_payload: { passage?: string }
//   grading_rubric:  { keywords: string[], min_word_count?: number, model_answer?: string }
//   student_answer:  string  (free text)
//
// comprehension — COMPOSITE, not a writing drill: one reading passage
// with a nested list of auto-gradable sub-questions (mcq/true_false/
// fill_blank only — no nested comprehension/paragraph/sentence_formation).
//   content_payload: {
//     passage_html: string,
//     sub_questions: [{ id, question_type, prompt, content_payload,
//                        grading_rubric, points }]
//   }
//   grading_rubric:  null — each sub-question carries its own rubric.
//   student_answer:  { sub_answers: { [subQuestionId]: <that sub's
//                       own student_answer shape> } }
//   The parent question's `points` column is NOT the scoring authority
//   for comprehension — see getQuestionMaxPoints below, which always
//   derives max score from the sum of sub_questions[].points so mentor
//   UI and grading can never drift apart.
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

// Bug 2 fix: two real defects here before this — (1) content_payload's
// documented `case_sensitive` flag was never actually read; every
// comparison went through normalizeText, which always lowercases;
// (2) multi-blank submissions arrive as one comma-joined string
// ("is,Now") with one acceptable answer per blank (acceptable_answers[i]
// is that blank's answer, positional) — a single
// `acceptable.includes(wholeString)` check can never match that shape,
// so a fully-correct multi-blank answer always graded wrong.
function gradeFillBlank(question, studentAnswer) {
  const rubric = question.grading_rubric || {};
  const payload = question.content_payload || {};
  const acceptable = rubric.acceptable_answers || [];
  const caseSensitive = Boolean(payload.case_sensitive);

  const normalize = (value) => {
    const text = typeof value === "string" ? value.trim() : "";
    return caseSensitive ? text : text.toLowerCase();
  };

  let isCorrect = false;

  if (
    acceptable.length > 1 &&
    typeof studentAnswer === "string" &&
    studentAnswer.includes(",")
  ) {
    const studentTokens = studentAnswer.split(",").map((token) => token.trim());
    if (studentTokens.length === acceptable.length) {
      isCorrect = studentTokens.every(
        (token, index) => normalize(token) === normalize(acceptable[index]),
      );
    }
  }

  // Single-blank path — also the fallback when a multi-answer rubric's
  // submission isn't the expected comma-joined shape.
  if (!isCorrect) {
    isCorrect = acceptable.some((answer) => normalize(answer) === normalize(studentAnswer));
  }

  return {
    isCorrect,
    scoreAwarded: isCorrect ? question.points : 0,
    feedback:
      rubric.explanation ||
      (acceptable.length ? `Accepted answers: ${acceptable.join(", ")}` : ""),
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

// Grades one sub-question of a composite comprehension question. A
// sub-question is shaped exactly like a top-level ExerciseQuestion row
// (question_type/content_payload/grading_rubric/points) so it can be fed
// straight into the same per-type graders above — no separate code path
// to keep in sync.
function gradeSubQuestion(subQuestion, subStudentAnswer) {
  switch (subQuestion.question_type) {
    case QUESTION_TYPES.MCQ:
    case QUESTION_TYPES.TRUE_FALSE:
      return gradeChoiceQuestion(subQuestion, subStudentAnswer);
    case QUESTION_TYPES.FILL_BLANK:
      return gradeFillBlank(subQuestion, subStudentAnswer);
    default:
      return { isCorrect: false, scoreAwarded: 0, feedback: "Unrecognized sub-question type." };
  }
}

// Composite comprehension grader — sums every sub-question's own grade.
// studentAnswer: { sub_answers: { [subQuestionId]: <answer> } }
function gradeComprehension(question, studentAnswer) {
  const subQuestions = question.content_payload?.sub_questions || [];
  const subAnswers = (studentAnswer && studentAnswer.sub_answers) || {};

  let scoreAwarded = 0;
  let maxPoints = 0;
  let allCorrect = subQuestions.length > 0;
  const subResults = [];

  for (const subQuestion of subQuestions) {
    const points = Number(subQuestion.points) || 1;
    maxPoints += points;

    const subStudentAnswer = subAnswers[subQuestion.id] ?? null;
    const graded = gradeSubQuestion({ ...subQuestion, points }, subStudentAnswer);

    scoreAwarded += graded.scoreAwarded;
    if (!graded.isCorrect) allCorrect = false;

    subResults.push({
      id: subQuestion.id,
      questionType: subQuestion.question_type,
      prompt: subQuestion.prompt,
      contentPayload: subQuestion.content_payload,
      gradingRubric: subQuestion.grading_rubric,
      points,
      studentAnswer: subStudentAnswer,
      isCorrect: graded.isCorrect,
      scoreAwarded: graded.scoreAwarded,
      feedback: graded.feedback,
    });
  }

  return {
    isCorrect: allCorrect,
    scoreAwarded: Math.round(scoreAwarded * 100) / 100,
    feedback: `${subResults.filter((r) => r.isCorrect).length}/${subQuestions.length} sub-questions correct.`,
    maxPoints,
    subResults,
  };
}

// Comprehension's real max score is the sum of its sub-questions' points,
// never the parent row's own `points` column (mentor UI derives that
// column for display, but grading always recomputes it here so the two
// can never silently drift apart).
function getQuestionMaxPoints(question) {
  if (question.question_type === QUESTION_TYPES.COMPREHENSION) {
    const subQuestions = question.content_payload?.sub_questions || [];
    return subQuestions.reduce((sum, sub) => sum + (Number(sub.points) || 1), 0);
  }
  return question.points;
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
      return gradeComprehension(question, studentAnswer);
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
      const graded = gradeAnswer(question, studentAnswer);
      const { isCorrect, scoreAwarded, feedback } = graded;
      const questionMaxPoints = getQuestionMaxPoints(question);

      totalScore += scoreAwarded;
      maxScore += questionMaxPoints;

      answerSheet.push({
        questionId: question.id,
        questionType: question.question_type,
        prompt: question.prompt,
        contentPayload: question.content_payload,
        gradingRubric: question.grading_rubric,
        points: questionMaxPoints,
        studentAnswer,
        isCorrect,
        scoreAwarded,
        feedback,
        // Comprehension only — per-sub-question breakdown for the
        // full-width diagnostic report card.
        subResults: graded.subResults || undefined,
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
