"use strict";

/**
 * Progression architecture fix — two gaps in progressionService.js:
 *
 * 1. Hardcoded pass thresholds. Lesson unlock/completion was never
 *    mentor-configurable. Adds a nullable `lessons.passing_score`
 *    (per-lesson override) and `batches.default_passing_threshold`
 *    (per-batch fallback, defaulting to the old hardcoded 70.00 so
 *    existing behavior is unchanged until a mentor opts in). Resolution
 *    order, enforced in progressionService.js:
 *      threshold = lesson.passing_score ?? batch.default_passing_threshold ?? 70.00
 *
 * 2. CEFR-only milestones. CEFR (A1-C2) doesn't fit NEP 2020 Indian
 *    language stages. Adds `lessons.framework` ('cefr' | 'nep_stage',
 *    defaulting to 'cefr' so every existing lesson keeps its current
 *    meaning) and `lessons.level_order` (nullable INT position within
 *    that framework's track — NULL means "not part of a tracked
 *    progression", so existing lessons neither advance nor block any
 *    mentee's progression until a mentor assigns one). A new
 *    `student_progressions` table carries each mentee's current
 *    position per framework (one row per mentee+framework), replacing
 *    the assumption that every mentee has exactly one CEFR position.
 *
 * Additive-only, no drops, single transaction, every step guarded
 * against re-run (same pattern as
 * 20260908090000-practice-session-tries.js).
 */

const LESSONS_TABLE = "lessons";
const BATCHES_TABLE = "batches";
const MENTEES_TABLE = "mentees";
const STUDENT_PROGRESSIONS_TABLE = "student_progressions";

const FRAMEWORK_VALUES = ["cefr", "nep_stage"];
const DEFAULT_PASSING_THRESHOLD = 70.0;

async function tableExists(queryInterface, table) {
  try {
    await queryInterface.describeTable(table);
    return true;
  } catch (error) {
    return false;
  }
}

async function columnExists(queryInterface, table, column) {
  const description = await queryInterface.describeTable(table);
  return Boolean(description[column]);
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // ---------------------------------------------------------------
      // 1. lessons.passing_score — nullable mentor override
      // ---------------------------------------------------------------
      if (!(await columnExists(queryInterface, LESSONS_TABLE, "passing_score"))) {
        await queryInterface.addColumn(
          LESSONS_TABLE,
          "passing_score",
          {
            type: Sequelize.DECIMAL(5, 2),
            allowNull: true,
          },
          { transaction },
        );
      }

      // ---------------------------------------------------------------
      // 2. lessons.framework / lessons.level_order — multi-framework
      //    milestone tracking
      // ---------------------------------------------------------------
      if (!(await columnExists(queryInterface, LESSONS_TABLE, "framework"))) {
        await queryInterface.addColumn(
          LESSONS_TABLE,
          "framework",
          {
            type: Sequelize.ENUM(...FRAMEWORK_VALUES),
            allowNull: false,
            defaultValue: "cefr",
          },
          { transaction },
        );
      }

      if (!(await columnExists(queryInterface, LESSONS_TABLE, "level_order"))) {
        await queryInterface.addColumn(
          LESSONS_TABLE,
          "level_order",
          {
            type: Sequelize.INTEGER,
            allowNull: true,
          },
          { transaction },
        );
      }

      // ---------------------------------------------------------------
      // 3. batches.default_passing_threshold — per-batch fallback
      // ---------------------------------------------------------------
      if (
        !(await columnExists(
          queryInterface,
          BATCHES_TABLE,
          "default_passing_threshold",
        ))
      ) {
        await queryInterface.addColumn(
          BATCHES_TABLE,
          "default_passing_threshold",
          {
            type: Sequelize.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: DEFAULT_PASSING_THRESHOLD,
          },
          { transaction },
        );
      }

      // ---------------------------------------------------------------
      // 4. student_progressions — one row per (mentee, framework)
      // ---------------------------------------------------------------
      if (!(await tableExists(queryInterface, STUDENT_PROGRESSIONS_TABLE))) {
        await queryInterface.createTable(
          STUDENT_PROGRESSIONS_TABLE,
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
            framework: {
              type: Sequelize.ENUM(...FRAMEWORK_VALUES),
              allowNull: false,
            },
            current_level_order: {
              type: Sequelize.INTEGER,
              allowNull: false,
              defaultValue: 0,
            },
            current_level_code: {
              type: Sequelize.STRING(20),
              allowNull: true,
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

        await queryInterface.addIndex(STUDENT_PROGRESSIONS_TABLE, {
          fields: ["mentee_id", "framework"],
          unique: true,
          name: "uniq_student_progressions_mentee_framework",
          transaction,
        });
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      if (await tableExists(queryInterface, STUDENT_PROGRESSIONS_TABLE)) {
        await queryInterface.dropTable(STUDENT_PROGRESSIONS_TABLE, {
          transaction,
        });
      }

      if (
        await columnExists(
          queryInterface,
          BATCHES_TABLE,
          "default_passing_threshold",
        )
      ) {
        await queryInterface.removeColumn(
          BATCHES_TABLE,
          "default_passing_threshold",
          { transaction },
        );
      }

      if (await columnExists(queryInterface, LESSONS_TABLE, "level_order")) {
        await queryInterface.removeColumn(LESSONS_TABLE, "level_order", {
          transaction,
        });
      }

      if (await columnExists(queryInterface, LESSONS_TABLE, "framework")) {
        await queryInterface.removeColumn(LESSONS_TABLE, "framework", {
          transaction,
        });
      }

      if (await columnExists(queryInterface, LESSONS_TABLE, "passing_score")) {
        await queryInterface.removeColumn(LESSONS_TABLE, "passing_score", {
          transaction,
        });
      }
    });
  },
};
