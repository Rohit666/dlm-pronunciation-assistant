"use strict";

/**
 * Restores progressive-attempt trajectory data without resurrecting the
 * redundant `lesson_attempts` design (see the revision note atop
 * 20260907090000-content-blocks-and-progressive-attempts.js).
 *
 * The previous patch made /compare purely transient and only ever wrote
 * one row (the final accepted submission) per practice_sessions — every
 * intermediate try, improving or not, was lost. That broke retry
 * analytics, attempt-to-mastery delta, and the trajectory chart.
 *
 * Fix, deliberately minimal:
 *
 * 1. practice_sessions.status gains a `submitted` value. A session row
 *    is now created at the FIRST /compare call for a
 *    (mentee, lesson_sentence, practice_attempt) tuple — status
 *    `started` — instead of at /submit. /submit flips that same row to
 *    `submitted` once an assessment is attached. `completed` is kept in
 *    the enum for backward compatibility (nothing writes it going
 *    forward) rather than removed, since MySQL/MariaDB ENUM columns
 *    can't drop a value without knowing no row still holds it.
 *
 * 2. practice_session_tries — one row per KEPT try (Progressive Filter
 *    Rule: strictly beats every score already logged for that session).
 *    Intermediate regressed comparisons are still never persisted here,
 *    exactly as the Transient-Compare architecture requires — only the
 *    trajectory of *improving* tries is. Deliberately narrow: just
 *    try_number + overall_score. No ai_payload/word/phoneme breakdown —
 *    that already lives in assessments/word_assessments/
 *    phoneme_assessments once a try is actually submitted. This is NOT
 *    the rejected lesson_attempts table; it carries none of that
 *    detail, only the score trajectory analytics needs.
 */

const PRACTICE_SESSIONS_TABLE = "practice_sessions";
const PRACTICE_SESSION_TRIES_TABLE = "practice_session_tries";
const STATUS_COLUMN = "status";
const NEW_ENUM_VALUES = ["started", "completed", "review_pending", "submitted"];

async function tableExists(queryInterface, table) {
  try {
    await queryInterface.describeTable(table);
    return true;
  } catch (error) {
    return false;
  }
}

async function getColumnType(queryInterface, table, column) {
  const [rows] = await queryInterface.sequelize.query(
    `SELECT COLUMN_TYPE FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table AND COLUMN_NAME = :column`,
    { replacements: { table, column } },
  );
  return rows[0] ? rows[0].COLUMN_TYPE : "";
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // ---------------------------------------------------------------
      // 1. practice_sessions.status: + 'submitted'
      // ---------------------------------------------------------------
      const currentType = await getColumnType(
        queryInterface,
        PRACTICE_SESSIONS_TABLE,
        STATUS_COLUMN,
      );

      if (!currentType.includes("'submitted'")) {
        await queryInterface.changeColumn(
          PRACTICE_SESSIONS_TABLE,
          STATUS_COLUMN,
          {
            type: Sequelize.ENUM(...NEW_ENUM_VALUES),
            defaultValue: "started",
            allowNull: false,
          },
          { transaction },
        );
      }

      // ---------------------------------------------------------------
      // 2. practice_session_tries
      // ---------------------------------------------------------------
      if (!(await tableExists(queryInterface, PRACTICE_SESSION_TRIES_TABLE))) {
        await queryInterface.createTable(
          PRACTICE_SESSION_TRIES_TABLE,
          {
            id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true,
            },
            practice_session_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: PRACTICE_SESSIONS_TABLE, key: "id" },
              onUpdate: "CASCADE",
              onDelete: "CASCADE",
            },
            try_number: {
              type: Sequelize.INTEGER,
              allowNull: false,
            },
            overall_score: {
              type: Sequelize.DECIMAL(5, 2),
              allowNull: false,
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

        await queryInterface.addIndex(PRACTICE_SESSION_TRIES_TABLE, {
          fields: ["practice_session_id", "try_number"],
          unique: true,
          name: "uniq_practice_session_tries_session_try",
          transaction,
        });
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      if (await tableExists(queryInterface, PRACTICE_SESSION_TRIES_TABLE)) {
        await queryInterface.dropTable(PRACTICE_SESSION_TRIES_TABLE, {
          transaction,
        });
      }

      const currentType = await getColumnType(
        queryInterface,
        PRACTICE_SESSIONS_TABLE,
        STATUS_COLUMN,
      );

      if (currentType.includes("'submitted'")) {
        await queryInterface.changeColumn(
          PRACTICE_SESSIONS_TABLE,
          STATUS_COLUMN,
          {
            type: Sequelize.ENUM("started", "completed", "review_pending"),
            defaultValue: "started",
            allowNull: false,
          },
          { transaction },
        );
      }
    });
  },
};
