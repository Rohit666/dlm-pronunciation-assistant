const {
  sequelize,
  Lesson,
  LessonExercise,
  ExerciseQuestion,
  ExerciseAttempt,
  Mentee,
  Batch,
  User,
} = require("../models");
const exerciseEvaluationService = require("../services/exerciseEvaluationService");
const { sanitizeBlockText } = require("../utils/sentenceBlocks");
const QUESTION_TYPES = require("../constants/exerciseQuestionTypes");

async function resolveMentee(userId) {
  return Mentee.findOne({ where: { user_id: userId } });
}

// Comprehension's content_payload nests its own rich-text HTML
// (passage_html, plus one prompt per sub-question) — sanitize every one
// of those before it reaches the DB, same discipline as the top-level
// `prompt` column below. Missed here, this HTML would round-trip
// straight into another user's dangerouslySetInnerHTML unsanitized.
function sanitizeQuestionContentPayload(questionType, contentPayload) {
  if (!contentPayload) return contentPayload;

  if (questionType === QUESTION_TYPES.COMPREHENSION) {
    return {
      ...contentPayload,
      passage_html: contentPayload.passage_html
        ? sanitizeBlockText(contentPayload.passage_html)
        : contentPayload.passage_html,
      sub_questions: Array.isArray(contentPayload.sub_questions)
        ? contentPayload.sub_questions.map((sub) => ({
            ...sub,
            prompt: sanitizeBlockText(sub.prompt || ""),
          }))
        : contentPayload.sub_questions,
    };
  }

  return contentPayload;
}

// Server-authoritative points, mirroring getQuestionMaxPoints in
// exerciseEvaluationService.js: comprehension's real point value is
// always the sum of its (already-sanitized) sub_questions, never
// whatever the client happened to send — Bug 3 fix, so a direct API
// call can't desync the stored `points` column from what grading
// actually awards.
function computeQuestionPoints(questionType, sanitizedContentPayload, clientPoints) {
  if (questionType === QUESTION_TYPES.COMPREHENSION) {
    const subQuestions = sanitizedContentPayload?.sub_questions || [];
    if (subQuestions.length) {
      return subQuestions.reduce((sum, sub) => sum + (Number(sub.points) || 1), 0);
    }
  }
  return clientPoints ?? 1;
}

// GET /api/lessons/:lessonId/exercises
// grading_rubric is stripped for mentees — it's the answer key. Mentor/
// admin get it back (needed to review/edit exercises), gated only by
// verifyToken here since lesson-management routes already gate creation
// by role; reading a lesson's own exercises is not sensitive by role.
exports.getLessonExercises = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const exercises = await LessonExercise.findAll({
      where: { lesson_id: lessonId },
      order: [["order_index", "ASC"]],
      include: [
        {
          model: ExerciseQuestion,
          as: "questions",
          separate: true,
          order: [["order_index", "ASC"]],
        },
      ],
    });

    const stripRubric = req.user?.role === "mentee";

    const payload = exercises.map((exercise) => {
      const exerciseJson = exercise.toJSON();
      return {
        ...exerciseJson,
        questions: exerciseJson.questions.map((question) =>
          stripRubric
            ? { ...question, grading_rubric: undefined }
            : question,
        ),
      };
    });

    res.json({ success: true, exercises: payload });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/exercises/:exerciseId/submit
// body: { answers: [{ questionId, studentAnswer }] }
exports.submitExercise = async (req, res) => {
  try {
    const { exerciseId } = req.params;
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: "answers must be an array" });
    }

    const mentee = await resolveMentee(req.user.id);
    if (!mentee) {
      return res.status(404).json({ success: false, message: "Mentee not found" });
    }

    const result = await exerciseEvaluationService.submitExerciseAttempt({
      exerciseId: Number(exerciseId),
      menteeId: mentee.id,
      answers,
    });

    res.status(201).json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    if (error.message === "Exercise not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/exercises/:exerciseId/attempts — the logged-in mentee's own
// attempt history, oldest to newest (attempt_number ascending) so a
// trend reads left-to-right.
exports.getExerciseAttempts = async (req, res) => {
  try {
    const { exerciseId } = req.params;

    const mentee = await resolveMentee(req.user.id);
    if (!mentee) {
      return res.status(404).json({ success: false, message: "Mentee not found" });
    }

    const attempts = await ExerciseAttempt.findAll({
      where: { exercise_id: exerciseId, mentee_id: mentee.id },
      order: [["attempt_number", "ASC"]],
    });

    res.json({ success: true, attempts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/mentee-dashboard/assessment-attempts — Comprehensive Assessment
// History Hub (mentee half): every assessment attempt this mentee has
// ever submitted, across every lesson, newest first. Mounted under
// mentee-dashboard (the mentee's existing cross-lesson data hub) rather
// than a new /api/mentee route file, since that router already exists
// for exactly this kind of "mentee's own data across lessons" query.
exports.getMenteeAssessmentAttempts = async (req, res) => {
  try {
    const mentee = await resolveMentee(req.user.id);
    if (!mentee) {
      return res.status(404).json({ success: false, message: "Mentee not found" });
    }

    const attempts = await ExerciseAttempt.findAll({
      where: { mentee_id: mentee.id },
      include: [
        {
          model: LessonExercise,
          attributes: ["id", "title", "lesson_id"],
          include: [{ model: Lesson, attributes: ["id", "title"] }],
        },
      ],
      order: [["submitted_at", "DESC"]],
    });

    res.json({ success: true, attempts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/exercises/attempts/:attemptId — the full Diagnostic Report
// Card for one of THIS mentee's own past attempts (ownership-checked —
// a mentee can never fetch another mentee's attempt by guessing an id).
// Two path segments, so it never collides with GET /:exerciseId above.
exports.getMenteeAttemptDetail = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const mentee = await resolveMentee(req.user.id);
    if (!mentee) {
      return res.status(404).json({ success: false, message: "Mentee not found" });
    }

    const attempt = await ExerciseAttempt.findOne({
      where: { id: attemptId, mentee_id: mentee.id },
      include: [
        {
          model: LessonExercise,
          attributes: ["id", "title", "passing_percentage", "lesson_id"],
          include: [{ model: Lesson, attributes: ["id", "title"] }],
        },
      ],
    });

    if (!attempt) {
      return res.status(404).json({ success: false, message: "Attempt not found" });
    }

    const answerSheet = await exerciseEvaluationService.buildAttemptAnswerSheet(
      attempt.id,
      attempt.exercise_id,
    );

    res.json({
      success: true,
      exercise: attempt.LessonExercise,
      attempt: exerciseEvaluationService.formatAttemptSummary(
        attempt,
        attempt.LessonExercise?.passing_percentage,
      ),
      answerSheet,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Shared by both mentor attempt endpoints below — mirrors
// mentorReviewController.getReviewAttempts' exact scoping convention
// (mentor -> their batches -> mentees in those batches), the
// established pattern for "which mentees can this mentor see" in this
// codebase. Admin bypasses batch scoping entirely (oversight access,
// same convention as exerciseController's other mentor/admin routes).
async function resolveMentorVisibleMenteeIds(req) {
  if (req.user.role === "admin") return null; // null = no restriction
  const mentorBatches = await Batch.findAll({ where: { mentor_id: req.user.id } });
  const batchIds = mentorBatches.map((batch) => batch.id);
  const mentees = await Mentee.findAll({ where: { batch_id: batchIds } });
  return mentees.map((mentee) => mentee.id);
}

// GET /api/mentor/exercises/:exerciseId/attempts — every attempt on this
// exercise submitted by a mentee in one of the mentor's own batches
// (admin sees every attempt on the exercise, unscoped).
exports.getExerciseAttemptsForMentor = async (req, res) => {
  try {
    const { exerciseId } = req.params;

    const exercise = await LessonExercise.findByPk(exerciseId);
    if (!exercise) {
      return res.status(404).json({ success: false, message: "Exercise not found" });
    }

    const visibleMenteeIds = await resolveMentorVisibleMenteeIds(req);
    const where = { exercise_id: exerciseId };
    if (visibleMenteeIds !== null) {
      where.mentee_id = visibleMenteeIds;
    }

    const attempts = await ExerciseAttempt.findAll({
      where,
      include: [
        {
          model: Mentee,
          attributes: ["id", "batch_id"],
          include: [
            { model: User, attributes: ["id", "name", "email"] },
            { model: Batch, attributes: ["id", "batch_name"] },
          ],
        },
      ],
      order: [["submitted_at", "DESC"]],
    });

    res.json({ success: true, exercise, attempts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/mentor/assessment-attempts/:attemptId — full answer sheet for
// one mentee's specific submission, so a mentor can audit exact answers,
// sub-question results, and awarded scores. Same batch-scoping as above
// — a mentor can't inspect an attempt from a mentee outside their
// batches by guessing an attempt id.
exports.getAttemptDetailForMentor = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await ExerciseAttempt.findByPk(attemptId, {
      include: [
        {
          model: Mentee,
          attributes: ["id", "batch_id"],
          include: [
            { model: User, attributes: ["id", "name", "email"] },
            { model: Batch, attributes: ["id", "batch_name"] },
          ],
        },
        {
          model: LessonExercise,
          attributes: ["id", "title", "passing_percentage", "lesson_id"],
          include: [{ model: Lesson, attributes: ["id", "title"] }],
        },
      ],
    });

    if (!attempt) {
      return res.status(404).json({ success: false, message: "Attempt not found" });
    }

    const visibleMenteeIds = await resolveMentorVisibleMenteeIds(req);
    if (visibleMenteeIds !== null && !visibleMenteeIds.includes(attempt.mentee_id)) {
      return res.status(404).json({ success: false, message: "Attempt not found" });
    }

    const answerSheet = await exerciseEvaluationService.buildAttemptAnswerSheet(
      attempt.id,
      attempt.exercise_id,
    );

    res.json({
      success: true,
      mentee: attempt.Mentee,
      exercise: attempt.LessonExercise,
      attempt: exerciseEvaluationService.formatAttemptSummary(
        attempt,
        attempt.LessonExercise?.passing_percentage,
      ),
      answerSheet,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/mentor/lessons/:lessonId/exercises — mentor authority.
// body: { title, instructions, passing_percentage, order_index, questions: [...] }
// Creates the exercise and all its questions atomically. Question prompts
// are sanitized server-side (same choke point as lesson_sentences'
// content_blocks) — this is rich-text HTML rendered to mentees later via
// dangerouslySetInnerHTML.
exports.createExercise = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const {
      title,
      instructions,
      passing_percentage,
      order_index,
      topic_id,
      questions,
    } = req.body;

    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }

    if (!title) {
      return res.status(400).json({ success: false, message: "title is required" });
    }

    const result = await sequelize.transaction(async (transaction) => {
      const exercise = await LessonExercise.create(
        {
          lesson_id: lessonId,
          topic_id: topic_id || null,
          title,
          instructions: instructions ? sanitizeBlockText(instructions) : null,
          passing_percentage: passing_percentage ?? 70.0,
          order_index: order_index ?? 1,
        },
        { transaction },
      );

      const questionRows = Array.isArray(questions) ? questions : [];
      if (questionRows.length) {
        await ExerciseQuestion.bulkCreate(
          questionRows.map((question, index) => {
            const sanitizedContentPayload = sanitizeQuestionContentPayload(
              question.question_type,
              question.content_payload || null,
            );
            return {
              exercise_id: exercise.id,
              question_type: question.question_type,
              prompt: sanitizeBlockText(question.prompt || ""),
              content_payload: sanitizedContentPayload,
              grading_rubric: question.grading_rubric || null,
              points: computeQuestionPoints(
                question.question_type,
                sanitizedContentPayload,
                question.points,
              ),
              order_index: question.order_index ?? index + 1,
            };
          }),
          { transaction },
        );
      }

      return exercise;
    });

    res.status(201).json({
      success: true,
      message: "Exercise created successfully",
      exercise: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/exercises/:exerciseId — single exercise, used by the
// full-width AssessmentPlayerPage (which lands on a direct route, not a
// list). Same grading_rubric-stripping rule as getLessonExercises.
exports.getExerciseById = async (req, res) => {
  try {
    const { exerciseId } = req.params;

    const exercise = await LessonExercise.findByPk(exerciseId, {
      include: [
        {
          model: ExerciseQuestion,
          as: "questions",
          separate: true,
          order: [["order_index", "ASC"]],
        },
      ],
    });

    if (!exercise) {
      return res.status(404).json({ success: false, message: "Exercise not found" });
    }

    const stripRubric = req.user?.role === "mentee";
    const exerciseJson = exercise.toJSON();

    res.json({
      success: true,
      exercise: {
        ...exerciseJson,
        questions: exerciseJson.questions.map((question) =>
          stripRubric ? { ...question, grading_rubric: undefined } : question,
        ),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/mentor/exercises/:exerciseId — mentor authority. Questions/
// attempts/attempt-answers all CASCADE off lesson_exercises (see the
// Milestone 9 migration), so this one delete is enough to remove the
// whole subtree.
exports.deleteExercise = async (req, res) => {
  try {
    const { exerciseId } = req.params;

    const exercise = await LessonExercise.findByPk(exerciseId);
    if (!exercise) {
      return res.status(404).json({ success: false, message: "Exercise not found" });
    }

    await exercise.destroy();

    res.json({ success: true, message: "Exercise deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
