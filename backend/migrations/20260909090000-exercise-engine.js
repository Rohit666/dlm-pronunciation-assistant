"use strict";

/**
 * Milestone 9 — Polymorphic Exercise & Assessment Engine.
 *
 * Hierarchy (mirrors the practice_sessions -> assessments ->
 * word_assessments -> phoneme_assessments normalization already in this
 * schema — same idea, different domain):
 *
 *   lessons (existing)
 *     -> lesson_exercises        (1:N — a lesson can carry multiple
 *                                  quiz-style exercises alongside its
 *                                  sentence-practice content)
 *          -> exercise_questions (1:N — polymorphic: question_type picks
 *                                  how content_payload/grading_rubric are
 *                                  interpreted; see exerciseEvaluationService.js)
 *          -> exercise_attempts  (1:N per mentee — retakable; attempt_number
 *                                  increments per (exercise, mentee) pair,
 *                                  every attempt kept for analytics, not
 *                                  overwritten)
 *               -> exercise_attempt_answers (1:N — one row per question
 *                                  answered in that attempt)
 *
 * All FKs CASCADE from lesson_exercises down, matching the CASCADE
 * convention already used for practice_session_tries.
 */

const LESSONS_TABLE = "lessons";
const MENTEES_TABLE = "mentees";
const LESSON_EXERCISES_TABLE = "lesson_exercises";
const EXERCISE_QUESTIONS_TABLE = "exercise_questions";
const EXERCISE_ATTEMPTS_TABLE = "exercise_attempts";
const EXERCISE_ATTEMPT_ANSWERS_TABLE = "exercise_attempt_answers";

const QUESTION_TYPES = [
  "mcq",
  "true_false",
  "fill_blank",
  "sentence_formation",
  "comprehension",
  "paragraph",
];

async function tableExists(queryInterface, table) {
  try {
    await queryInterface.describeTable(table);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // ---------------------------------------------------------------
      // lesson_exercises
      // ---------------------------------------------------------------
      if (!(await tableExists(queryInterface, LESSON_EXERCISES_TABLE))) {
        await queryInterface.createTable(
          LESSON_EXERCISES_TABLE,
          {
            id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
            lesson_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: LESSONS_TABLE, key: "id" },
              onUpdate: "CASCADE",
              onDelete: "CASCADE",
            },
            title: { type: Sequelize.STRING(255), allowNull: false },
            instructions: { type: Sequelize.TEXT, allowNull: true },
            passing_percentage: {
              type: Sequelize.DECIMAL(5, 2),
              allowNull: false,
              defaultValue: 70.0,
            },
            order_index: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
            created_at: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updated_at: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal(
                "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
              ),
            },
          },
          { transaction },
        );

        await queryInterface.addIndex(LESSON_EXERCISES_TABLE, {
          fields: ["lesson_id"],
          name: "idx_lesson_exercises_lesson_id",
          transaction,
        });
      }

      // ---------------------------------------------------------------
      // exercise_questions
      // ---------------------------------------------------------------
      if (!(await tableExists(queryInterface, EXERCISE_QUESTIONS_TABLE))) {
        await queryInterface.createTable(
          EXERCISE_QUESTIONS_TABLE,
          {
            id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
            exercise_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: LESSON_EXERCISES_TABLE, key: "id" },
              onUpdate: "CASCADE",
              onDelete: "CASCADE",
            },
            question_type: {
              type: Sequelize.ENUM(...QUESTION_TYPES),
              allowNull: false,
            },
            // Rich-text prompt (HTML) — same "sanitize before render"
            // discipline as lesson_sentences.content_blocks: mentor-authored
            // HTML is sanitized server-side (sanitizeBlockText-style) before
            // it can reach another user's dangerouslySetInnerHTML.
            prompt: { type: Sequelize.TEXT, allowNull: false },
            // Shape depends on question_type — see exerciseEvaluationService.js
            // for the exact contract per type (options list / passage text /
            // scrambled tokens / attachments).
            content_payload: { type: Sequelize.JSON, allowNull: true },
            // Never sent to a mentee (exerciseController strips this field
            // in getLessonExercises for role=mentee).
            grading_rubric: { type: Sequelize.JSON, allowNull: true },
            points: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
            order_index: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
            created_at: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updated_at: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal(
                "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
              ),
            },
          },
          { transaction },
        );

        await queryInterface.addIndex(EXERCISE_QUESTIONS_TABLE, {
          fields: ["exercise_id"],
          name: "idx_exercise_questions_exercise_id",
          transaction,
        });
      }

      // ---------------------------------------------------------------
      // exercise_attempts
      // ---------------------------------------------------------------
      if (!(await tableExists(queryInterface, EXERCISE_ATTEMPTS_TABLE))) {
        await queryInterface.createTable(
          EXERCISE_ATTEMPTS_TABLE,
          {
            id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
            exercise_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: LESSON_EXERCISES_TABLE, key: "id" },
              onUpdate: "CASCADE",
              onDelete: "CASCADE",
            },
            mentee_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: MENTEES_TABLE, key: "id" },
              onUpdate: "CASCADE",
              onDelete: "CASCADE",
            },
            // Per (exercise_id, mentee_id) — every retake keeps its own row,
            // never overwritten (unique index below prevents a race from
            // ever double-assigning the same attempt_number).
            attempt_number: { type: Sequelize.INTEGER, allowNull: false },
            total_score: { type: Sequelize.DECIMAL(5, 2), allowNull: false },
            max_score: { type: Sequelize.DECIMAL(5, 2), allowNull: false },
            percentage: { type: Sequelize.DECIMAL(5, 2), allowNull: false },
            passed: { type: Sequelize.BOOLEAN, allowNull: false },
            submitted_at: { type: Sequelize.DATE, allowNull: false },
            created_at: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updated_at: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal(
                "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
              ),
            },
          },
          { transaction },
        );

        await queryInterface.addIndex(EXERCISE_ATTEMPTS_TABLE, {
          fields: ["exercise_id"],
          name: "idx_exercise_attempts_exercise_id",
          transaction,
        });
        await queryInterface.addIndex(EXERCISE_ATTEMPTS_TABLE, {
          fields: ["mentee_id"],
          name: "idx_exercise_attempts_mentee_id",
          transaction,
        });
        await queryInterface.addIndex(EXERCISE_ATTEMPTS_TABLE, {
          fields: ["exercise_id", "mentee_id", "attempt_number"],
          unique: true,
          name: "uniq_exercise_attempts_exercise_mentee_attempt",
          transaction,
        });
      }

      // ---------------------------------------------------------------
      // exercise_attempt_answers
      // ---------------------------------------------------------------
      if (!(await tableExists(queryInterface, EXERCISE_ATTEMPT_ANSWERS_TABLE))) {
        await queryInterface.createTable(
          EXERCISE_ATTEMPT_ANSWERS_TABLE,
          {
            id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
            exercise_attempt_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: EXERCISE_ATTEMPTS_TABLE, key: "id" },
              onUpdate: "CASCADE",
              onDelete: "CASCADE",
            },
            question_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: EXERCISE_QUESTIONS_TABLE, key: "id" },
              onUpdate: "CASCADE",
              onDelete: "CASCADE",
            },
            student_answer: { type: Sequelize.JSON, allowNull: true },
            is_correct: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
            score_awarded: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
            feedback: { type: Sequelize.TEXT, allowNull: true },
            created_at: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updated_at: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal(
                "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
              ),
            },
          },
          { transaction },
        );

        await queryInterface.addIndex(EXERCISE_ATTEMPT_ANSWERS_TABLE, {
          fields: ["exercise_attempt_id"],
          name: "idx_exercise_attempt_answers_attempt_id",
          transaction,
        });
        await queryInterface.addIndex(EXERCISE_ATTEMPT_ANSWERS_TABLE, {
          fields: ["question_id"],
          name: "idx_exercise_attempt_answers_question_id",
          transaction,
        });
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      for (const table of [
        EXERCISE_ATTEMPT_ANSWERS_TABLE,
        EXERCISE_ATTEMPTS_TABLE,
        EXERCISE_QUESTIONS_TABLE,
        LESSON_EXERCISES_TABLE,
      ]) {
        if (await tableExists(queryInterface, table)) {
          await queryInterface.dropTable(table, { transaction });
        }
      }
    });
  },
};
