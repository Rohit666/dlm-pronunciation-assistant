"use strict";

/**
 * Schema reconciliation migration, built from a real dump
 * (dlm_pronunciation_assistant, MariaDB 10.4.11) diffed field-by-field
 * against models/*.js. Supersedes the earlier guessed migration
 * (deleted) which was written without dump access and would have
 * duplicated FK constraints that already exist under different names.
 *
 * Confirmed real gaps only. Additive-only, no drops, single
 * transaction (atomic), every step guarded against re-run.
 *
 *   1. FK constraints genuinely missing (everything else already has one):
 *      - practice_attempts.reviewed_by -> users.id
 *      - practice_sessions.reviewed_by -> users.id
 *
 *   2. Indexes genuinely missing:
 *      - practice_attempts.reviewed_by
 *      - practice_attempts.review_status
 *      - practice_sessions.reviewed_by
 *      - practice_sessions.status
 *      - composite (lesson_id, sentence_order) on lesson_sentences
 *        (ordering query in lessonController/frontend drag-reorder)
 *      - composite (mentee_id, lesson_id, status) on practice_attempts
 *        (matches practiceAttemptService.getOrCreatePracticeAttempt)
 *
 *   3. Data-integrity parity: `lessons.lesson_outcomes` has a
 *      `CHECK (json_valid(...))` constraint, `lessons.target_skills`
 *      does not, even though both are populated the same way
 *      (JSON.stringify from lessonController.js). Adds the same
 *      CHECK to target_skills. NULL passes the check, so existing
 *      NULL rows are unaffected; only genuinely malformed JSON would
 *      fail, matching what lesson_outcomes already enforces.
 *
 * NOT touched here (see accompanying note): practice_attempts'
 * existing mentee_id/lesson_id FKs have no ON DELETE clause (default
 * RESTRICT) while every other FK in the schema uses CASCADE/SET NULL.
 * Left alone deliberately — changing delete behavior on a live
 * constraint is a judgment call for you, not a "missing piece" to
 * silently fix.
 */

const FOREIGN_KEYS = [
  {
    table: "practice_attempts",
    column: "reviewed_by",
    refTable: "users",
    refColumn: "id",
    onDelete: "SET NULL",
    constraintName: "fk_practice_attempts_reviewed_by",
  },
  {
    table: "practice_sessions",
    column: "reviewed_by",
    refTable: "users",
    refColumn: "id",
    onDelete: "SET NULL",
    constraintName: "fk_practice_sessions_reviewed_by",
  },
];

const INDEXES = [
  { table: "practice_attempts", fields: ["reviewed_by"], name: "idx_practice_attempts_reviewed_by" },
  { table: "practice_attempts", fields: ["review_status"], name: "idx_practice_attempts_review_status" },
  {
    table: "practice_attempts",
    fields: ["mentee_id", "lesson_id", "status"],
    name: "idx_practice_attempts_mentee_lesson_status",
  },
  { table: "practice_sessions", fields: ["reviewed_by"], name: "idx_practice_sessions_reviewed_by" },
  { table: "practice_sessions", fields: ["status"], name: "idx_practice_sessions_status" },
  {
    table: "lesson_sentences",
    fields: ["lesson_id", "sentence_order"],
    name: "idx_lesson_sentences_lesson_id_sentence_order",
  },
];

const TARGET_SKILLS_CHECK_NAME = "chk_lessons_target_skills_json_valid";

async function constraintExists(queryInterface, table, constraintName, transaction) {
  const [rows] = await queryInterface.sequelize.query(
    `SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table AND CONSTRAINT_NAME = :constraintName`,
    { replacements: { table, constraintName }, transaction },
  );
  return rows.length > 0;
}

async function indexExists(queryInterface, table, indexName, transaction) {
  const [rows] = await queryInterface.sequelize.query(
    `SELECT INDEX_NAME FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table AND INDEX_NAME = :indexName`,
    { replacements: { table, indexName }, transaction },
  );
  return rows.length > 0;
}

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 1. Indexes first (constraint below can reuse them).
      for (const { table, fields, name } of INDEXES) {
        const exists = await indexExists(queryInterface, table, name, transaction);
        if (!exists) {
          await queryInterface.addIndex(table, fields, { name, transaction });
        }
      }

      // 2. The two genuinely-missing FK constraints.
      for (const fk of FOREIGN_KEYS) {
        const exists = await constraintExists(queryInterface, fk.table, fk.constraintName, transaction);
        if (!exists) {
          await queryInterface.addConstraint(fk.table, {
            fields: [fk.column],
            type: "foreign key",
            name: fk.constraintName,
            references: { table: fk.refTable, field: fk.refColumn },
            onDelete: fk.onDelete,
            onUpdate: "CASCADE",
            transaction,
          });
        }
      }

      // 3. JSON-validity parity for target_skills (matches lesson_outcomes).
      const hasCheck = await constraintExists(
        queryInterface,
        "lessons",
        TARGET_SKILLS_CHECK_NAME,
        transaction,
      );
      if (!hasCheck) {
        await queryInterface.sequelize.query(
          `ALTER TABLE \`lessons\` ADD CONSTRAINT \`${TARGET_SKILLS_CHECK_NAME}\` CHECK (json_valid(\`target_skills\`))`,
          { transaction },
        );
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const hasCheck = await constraintExists(
        queryInterface,
        "lessons",
        TARGET_SKILLS_CHECK_NAME,
        transaction,
      );
      if (hasCheck) {
        await queryInterface.sequelize.query(
          `ALTER TABLE \`lessons\` DROP CONSTRAINT \`${TARGET_SKILLS_CHECK_NAME}\``,
          { transaction },
        );
      }

      for (const fk of FOREIGN_KEYS) {
        const exists = await constraintExists(queryInterface, fk.table, fk.constraintName, transaction);
        if (exists) {
          await queryInterface.removeConstraint(fk.table, fk.constraintName, { transaction });
        }
      }

      for (const { table, name } of INDEXES) {
        const exists = await indexExists(queryInterface, table, name, transaction);
        if (exists) {
          await queryInterface.removeIndex(table, name, { transaction });
        }
      }
    });
  },
};
