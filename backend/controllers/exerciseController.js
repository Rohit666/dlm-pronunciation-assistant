const {
  sequelize,
  Lesson,
  LessonExercise,
  ExerciseQuestion,
  ExerciseAttempt,
  Mentee,
} = require("../models");
const exerciseEvaluationService = require("../services/exerciseEvaluationService");
const { sanitizeBlockText } = require("../utils/sentenceBlocks");

async function resolveMentee(userId) {
  return Mentee.findOne({ where: { user_id: userId } });
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
          questionRows.map((question, index) => ({
            exercise_id: exercise.id,
            question_type: question.question_type,
            prompt: sanitizeBlockText(question.prompt || ""),
            content_payload: question.content_payload || null,
            grading_rubric: question.grading_rubric || null,
            points: question.points ?? 1,
            order_index: question.order_index ?? index + 1,
          })),
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
