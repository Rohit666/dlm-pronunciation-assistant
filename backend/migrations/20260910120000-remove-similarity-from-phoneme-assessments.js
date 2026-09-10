"use strict";

/**
 * Authoritative correction to the speech evaluation persistence schema:
 * phoneme_assessments must carry only the comparison engine's actual
 * discrete evidence — operations, exact boolean matches, expected/
 * detected symbols, and phonetic features — never a synthetic scalar
 * "similarity" float.
 *
 * The table as created by 20260907120000-normalized-assessment-schema.js
 * predates this target shape entirely: it has no `position`, `matched`,
 * or stress/category columns, `operation` is a plain STRING(20) rather
 * than an ENUM, and it carries the now-rejected `similarity`
 * DECIMAL(4,3). This migration is not a pure drop — it brings the table
 * up to the full target shape in one pass:
 *
 *   1. ADD position, matched, expected_stress, expected_secondary_stress,
 *      expected_long, expected_category
 *   2. Backfill matched = TRUE for existing operation = 'exact_match'
 *      rows (the one piece of discrete evidence recoverable from data
 *      already on disk)
 *   3. CONVERT operation STRING(20) -> ENUM('exact_match','substitution',
 *      'deletion','insertion'), matching ai-runtime's
 *      AlignmentOperation exactly
 *   4. DROP similarity — DESTRUCTIVE, see warning in down()
 *   5. ADD composite indexes (expected_symbol, operation) and
 *      (word_assessment_id, position)
 *
 * `position` backfills existing rows to 0: their true per-word phoneme
 * index isn't recoverable after the fact without re-running the
 * comparison engine, so 0 is a placeholder for pre-migration rows only —
 * new rows get their real index from
 * assessmentAdapter.js's normalizePhonemeSteps. Same placeholder
 * reasoning for expected_stress/expected_secondary_stress/expected_long
 * (default false) and expected_category (default null) on existing rows.
 */

const TABLE = "phoneme_assessments";
const OPERATION_ENUM_VALUES = ["exact_match", "substitution", "deletion", "insertion"];

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
  return Object.prototype.hasOwnProperty.call(description, column);
}

async function getColumnType(queryInterface, table, column) {
  const [rows] = await queryInterface.sequelize.query(
    `SELECT COLUMN_TYPE FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table AND COLUMN_NAME = :column`,
    { replacements: { table, column } },
  );
  return rows[0] ? rows[0].COLUMN_TYPE : "";
}

async function indexExists(queryInterface, table, indexName) {
  const [rows] = await queryInterface.sequelize.query(
    `SELECT DISTINCT INDEX_NAME FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table AND INDEX_NAME = :indexName`,
    { replacements: { table, indexName } },
  );
  return rows.length > 0;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    if (!(await tableExists(queryInterface, TABLE))) return;

    await queryInterface.sequelize.transaction(async (transaction) => {
      // ---------------------------------------------------------------
      // 1. Add missing discrete-evidence columns
      // ---------------------------------------------------------------
      if (!(await columnExists(queryInterface, TABLE, "position"))) {
        await queryInterface.addColumn(
          TABLE,
          "position",
          { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
          { transaction },
        );
      }

      if (!(await columnExists(queryInterface, TABLE, "matched"))) {
        await queryInterface.addColumn(
          TABLE,
          "matched",
          { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
          { transaction },
        );
      }

      if (!(await columnExists(queryInterface, TABLE, "expected_stress"))) {
        await queryInterface.addColumn(
          TABLE,
          "expected_stress",
          { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
          { transaction },
        );
      }

      if (!(await columnExists(queryInterface, TABLE, "expected_secondary_stress"))) {
        await queryInterface.addColumn(
          TABLE,
          "expected_secondary_stress",
          { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
          { transaction },
        );
      }

      if (!(await columnExists(queryInterface, TABLE, "expected_long"))) {
        await queryInterface.addColumn(
          TABLE,
          "expected_long",
          { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
          { transaction },
        );
      }

      if (!(await columnExists(queryInterface, TABLE, "expected_category"))) {
        await queryInterface.addColumn(
          TABLE,
          "expected_category",
          { type: Sequelize.STRING(64), allowNull: true },
          { transaction },
        );
      }

      // Backfill matched=true for existing exact_match rows — the one
      // piece of the new discrete-evidence shape recoverable from what
      // is already on disk.
      await queryInterface.sequelize.query(
        `UPDATE ${TABLE} SET matched = TRUE WHERE operation = 'exact_match'`,
        { transaction },
      );

      // ---------------------------------------------------------------
      // 2. operation: STRING(20) -> ENUM
      // ---------------------------------------------------------------
      const operationType = await getColumnType(queryInterface, TABLE, "operation");
      if (!operationType.toLowerCase().startsWith("enum")) {
        await queryInterface.changeColumn(
          TABLE,
          "operation",
          { type: Sequelize.ENUM(...OPERATION_ENUM_VALUES), allowNull: false },
          { transaction },
        );
      }

      // ---------------------------------------------------------------
      // 3. Drop similarity — DESTRUCTIVE. Any float value stored here is
      //    permanently lost once this migration runs against a real
      //    database with data in it. It was a synthetic scalar the
      //    comparison engine's response never guaranteed as ground
      //    truth; nothing downstream is meant to depend on its exact
      //    value going forward (see mentorInsightsService.js and
      //    menteeInsightsService.js, refactored in this same change to
      //    stop reading it).
      // ---------------------------------------------------------------
      if (await columnExists(queryInterface, TABLE, "similarity")) {
        await queryInterface.removeColumn(TABLE, "similarity", { transaction });
      }

      // ---------------------------------------------------------------
      // 4. Composite indexes
      // ---------------------------------------------------------------
      if (!(await indexExists(queryInterface, TABLE, "idx_phoneme_assessments_symbol_operation"))) {
        await queryInterface.addIndex(TABLE, {
          fields: ["expected_symbol", "operation"],
          name: "idx_phoneme_assessments_symbol_operation",
          transaction,
        });
      }

      if (!(await indexExists(queryInterface, TABLE, "idx_phoneme_assessments_word_position"))) {
        await queryInterface.addIndex(TABLE, {
          fields: ["word_assessment_id", "position"],
          name: "idx_phoneme_assessments_word_position",
          transaction,
        });
      }
    });
  },

  async down(queryInterface, Sequelize) {
    if (!(await tableExists(queryInterface, TABLE))) return;

    await queryInterface.sequelize.transaction(async (transaction) => {
      if (await indexExists(queryInterface, TABLE, "idx_phoneme_assessments_word_position")) {
        await queryInterface.removeIndex(TABLE, "idx_phoneme_assessments_word_position", { transaction });
      }
      if (await indexExists(queryInterface, TABLE, "idx_phoneme_assessments_symbol_operation")) {
        await queryInterface.removeIndex(TABLE, "idx_phoneme_assessments_symbol_operation", { transaction });
      }

      // similarity is NOT restored with real values — that data was
      // permanently deleted in up(). Re-added nullable only so a
      // rollback leaves a schema-complete table instead of a
      // half-migrated one; every row comes back NULL.
      if (!(await columnExists(queryInterface, TABLE, "similarity"))) {
        await queryInterface.addColumn(
          TABLE,
          "similarity",
          { type: Sequelize.DECIMAL(4, 3), allowNull: true },
          { transaction },
        );
      }

      const operationType = await getColumnType(queryInterface, TABLE, "operation");
      if (operationType.toLowerCase().startsWith("enum")) {
        await queryInterface.changeColumn(
          TABLE,
          "operation",
          { type: Sequelize.STRING(20), allowNull: false },
          { transaction },
        );
      }

      for (const column of [
        "expected_category",
        "expected_long",
        "expected_secondary_stress",
        "expected_stress",
        "matched",
        "position",
      ]) {
        if (await columnExists(queryInterface, TABLE, column)) {
          await queryInterface.removeColumn(TABLE, column, { transaction });
        }
      }
    });
  },
};
