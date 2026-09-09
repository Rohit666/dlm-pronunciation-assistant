"use strict";

/**
 * Requirement 1 (Autonomous Mentee Milestone & Progression) needs a place
 * to record a mentee's current CEFR level and the milestones they've
 * cleared, independent of mentor review. Requirement 3 (Multi-Skill
 * Lesson Architecture) depends on `lessons.target_skills` / `lesson_type`
 * — both were confirmed already present on this repo's `lessons` table
 * (wired end-to-end in lessonController.js already) but no migration in
 * this repo's history creates them, meaning they came from the original
 * SQL dump. This migration adds them defensively too (idempotent
 * no-op if already present) so a fresh database built from migrations
 * alone — not the dump — still has what recommendationService.js and
 * the lesson CRUD flow require.
 *
 * 1. mentees.current_cefr_level — STRING(10), defaults 'A1'. The single
 *    source of truth for "what CEFR level is this mentee unlocked
 *    through". Lesson-unlock itself is computed on read (a lesson is
 *    locked if its cefr_level sits after this in [A1..C2]) — nothing
 *    else to store for that half.
 *
 * 2. mentee_cefr_milestones — one row per (mentee, cefr_level) the
 *    mentee has cleared: every published lesson at that level has a
 *    submitted attempt scoring >= the pass threshold. Unique index
 *    prevents progressionService's findOrCreate from ever double-
 *    recording the same level.
 *
 * 3. lessons.target_skills / lessons.lesson_type — additive, only runs
 *    if missing.
 */

const MENTEES_TABLE = "mentees";
const MILESTONES_TABLE = "mentee_cefr_milestones";
const LESSONS_TABLE = "lessons";

async function columnExists(queryInterface, table, column) {
  const description = await queryInterface.describeTable(table);
  return Object.prototype.hasOwnProperty.call(description, column);
}

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
      // 1. mentees.current_cefr_level
      // ---------------------------------------------------------------
      if (!(await columnExists(queryInterface, MENTEES_TABLE, "current_cefr_level"))) {
        await queryInterface.addColumn(
          MENTEES_TABLE,
          "current_cefr_level",
          {
            type: Sequelize.STRING(10),
            allowNull: false,
            defaultValue: "A1",
          },
          { transaction },
        );
      }

      // ---------------------------------------------------------------
      // 2. mentee_cefr_milestones
      // ---------------------------------------------------------------
      if (!(await tableExists(queryInterface, MILESTONES_TABLE))) {
        await queryInterface.createTable(
          MILESTONES_TABLE,
          {
            id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true,
            },
            mentee_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: MENTEES_TABLE, key: "id" },
              onUpdate: "CASCADE",
              onDelete: "CASCADE",
            },
            cefr_level: {
              type: Sequelize.STRING(10),
              allowNull: false,
            },
            accuracy_at_completion: {
              type: Sequelize.DECIMAL(5, 2),
              allowNull: true,
            },
            achieved_at: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
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

        await queryInterface.addIndex(MILESTONES_TABLE, {
          fields: ["mentee_id", "cefr_level"],
          unique: true,
          name: "uniq_mentee_cefr_milestones_mentee_level",
          transaction,
        });
      }

      // ---------------------------------------------------------------
      // 3. lessons.target_skills / lessons.lesson_type — safety net only
      // ---------------------------------------------------------------
      if (!(await columnExists(queryInterface, LESSONS_TABLE, "target_skills"))) {
        await queryInterface.addColumn(
          LESSONS_TABLE,
          "target_skills",
          {
            type: Sequelize.JSON,
            allowNull: true,
          },
          { transaction },
        );
      }

      if (!(await columnExists(queryInterface, LESSONS_TABLE, "lesson_type"))) {
        await queryInterface.addColumn(
          LESSONS_TABLE,
          "lesson_type",
          {
            type: Sequelize.STRING(30),
            allowNull: false,
            defaultValue: "sentence_practice",
          },
          { transaction },
        );
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      if (await tableExists(queryInterface, MILESTONES_TABLE)) {
        await queryInterface.dropTable(MILESTONES_TABLE, { transaction });
      }

      if (await columnExists(queryInterface, MENTEES_TABLE, "current_cefr_level")) {
        await queryInterface.removeColumn(MENTEES_TABLE, "current_cefr_level", {
          transaction,
        });
      }

      // lessons.target_skills / lesson_type intentionally left in place
      // on down — they predate this migration on real databases and
      // other code paths (lessonController.js) depend on them
      // unconditionally; removing them here would be destructive well
      // beyond what this migration added.
    });
  },
};
