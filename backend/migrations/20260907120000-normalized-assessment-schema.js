"use strict";

/**
 * Normalized AI assessment schema, hanging off practice_sessions
 * (already the sentence-level submission log: mentee_id +
 * lesson_sentence_id + practice_attempt_id). Replaces the earlier
 * `lesson_attempts` design — see the revision note in
 * 20260907090000-content-blocks-and-progressive-attempts.js.
 *
 * Hierarchy:
 *   practice_sessions (existing)
 *     -> assessments            (1:1 — one accepted-or-not AI evaluation
 *                                 per session; a session is only created
 *                                 at submit time, so this is naturally 1:1)
 *          -> word_assessments  (1:N — canonical per-word breakdown,
 *                                 sourced from assessment_document.words;
 *                                 NOT duplicated from
 *                                 assessment_document.sentences[].words,
 *                                 which repeats the same objects)
 *               -> phoneme_assessments (1:N — per-word phoneme-level
 *                                 comparison, sourced from
 *                                 word.pronunciation.phoneme_comparison.
 *                                 The sentence-wide positional comparison
 *                                 at assessment_document.pronunciation
 *                                 .phoneme_comparison is NOT separately
 *                                 normalized — it's redundant with the
 *                                 union of per-word comparisons, and
 *                                 stays fully available in
 *                                 assessment_snapshots.raw_payload for
 *                                 audit)
 *          -> diagnoses         (1:1 — from result.diagnosis)
 *               -> learning_needs (1:N — from diagnosis.needs)
 *          -> assessment_snapshots (1:1 — raw_payload / feedback_snapshot
 *                                 / trace, verbatim, for auditability)
 *
 * All FKs CASCADE from assessments down, so deleting an assessment
 * (or its practice_session) cleans up its whole subtree.
 */

const TABLES = {
  ASSESSMENTS: "assessments",
  WORD_ASSESSMENTS: "word_assessments",
  PHONEME_ASSESSMENTS: "phoneme_assessments",
  DIAGNOSES: "diagnoses",
  LEARNING_NEEDS: "learning_needs",
  ASSESSMENT_SNAPSHOTS: "assessment_snapshots",
};

// Superseded design from before this revision — see the note atop
// 20260907090000-content-blocks-and-progressive-attempts.js. Dropped
// here defensively in case that migration ran before the revision;
// it is brand new and empty either way (this sprint's own addition),
// so dropping it loses no real attempt data.
const OBSOLETE_LESSON_ATTEMPTS_TABLE = "lesson_attempts";

async function tableExists(queryInterface, table) {
  try {
    await queryInterface.describeTable(table);
    return true;
  } catch (error) {
    return false;
  }
}

const TIMESTAMP_COLUMNS = (Sequelize) => ({
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
});

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      if (await tableExists(queryInterface, OBSOLETE_LESSON_ATTEMPTS_TABLE)) {
        await queryInterface.dropTable(OBSOLETE_LESSON_ATTEMPTS_TABLE, {
          transaction,
        });
      }

      // ---------------------------------------------------------------
      // assessments — 1:1 with practice_sessions
      // ---------------------------------------------------------------
      if (!(await tableExists(queryInterface, TABLES.ASSESSMENTS))) {
        await queryInterface.createTable(
          TABLES.ASSESSMENTS,
          {
            id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true,
            },
            practice_session_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              unique: true, // enforces the 1:1
              references: { model: "practice_sessions", key: "id" },
              onUpdate: "CASCADE",
              onDelete: "CASCADE",
            },
            overall_accuracy: {
              type: Sequelize.DECIMAL(5, 2),
              allowNull: false,
            },
            total_reference: { type: Sequelize.INTEGER, defaultValue: 0 },
            exact_matches: { type: Sequelize.INTEGER, defaultValue: 0 },
            substitutions: { type: Sequelize.INTEGER, defaultValue: 0 },
            insertions: { type: Sequelize.INTEGER, defaultValue: 0 },
            deletions: { type: Sequelize.INTEGER, defaultValue: 0 },
            recognition_state: {
              type: Sequelize.STRING(20),
              allowNull: true,
            },
            recognition_success: {
              type: Sequelize.BOOLEAN,
              defaultValue: true,
            },
            recognized_words: { type: Sequelize.INTEGER, defaultValue: 0 },
            total_words: { type: Sequelize.INTEGER, defaultValue: 0 },
            expected_text: { type: Sequelize.TEXT, allowNull: true },
            detected_text: { type: Sequelize.TEXT, allowNull: true },
            transcript: { type: Sequelize.TEXT, allowNull: true },
            // The student's chosen/official submission. Every row here
            // is already the result of a real /submit call (compare()
            // never writes this table), so is_accepted defaults true;
            // it flips false only if a later submission for the same
            // sentence supersedes it (see practiceController.submit).
            is_accepted: {
              type: Sequelize.BOOLEAN,
              allowNull: false,
              defaultValue: true,
            },
            ...TIMESTAMP_COLUMNS(Sequelize),
          },
          { transaction },
        );

        await queryInterface.addIndex(TABLES.ASSESSMENTS, {
          fields: ["is_accepted"],
          name: "idx_assessments_is_accepted",
          transaction,
        });
      }

      // ---------------------------------------------------------------
      // word_assessments — 1:N with assessments
      // ---------------------------------------------------------------
      if (!(await tableExists(queryInterface, TABLES.WORD_ASSESSMENTS))) {
        await queryInterface.createTable(
          TABLES.WORD_ASSESSMENTS,
          {
            id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true,
            },
            assessment_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: TABLES.ASSESSMENTS, key: "id" },
              onUpdate: "CASCADE",
              onDelete: "CASCADE",
            },
            word_index: { type: Sequelize.INTEGER, allowNull: false },
            expected_word: { type: Sequelize.STRING(255), allowNull: false },
            // Python naming is student_word — mapped to detected_word by
            // assessmentAdapter.js before this ever reaches Sequelize.
            detected_word: { type: Sequelize.STRING(255), allowNull: true },
            operation: { type: Sequelize.STRING(20), allowNull: false },
            accepted: { type: Sequelize.BOOLEAN, defaultValue: false },
            confidence: { type: Sequelize.DECIMAL(4, 3), allowNull: true },
            accuracy: { type: Sequelize.DECIMAL(5, 2), allowNull: false },
            weak_phonemes: { type: Sequelize.JSON, allowNull: true },
            ...TIMESTAMP_COLUMNS(Sequelize),
          },
          { transaction },
        );

        await queryInterface.addIndex(TABLES.WORD_ASSESSMENTS, {
          fields: ["assessment_id"],
          name: "idx_word_assessments_assessment",
          transaction,
        });
      }

      // ---------------------------------------------------------------
      // phoneme_assessments — 1:N with word_assessments
      // ---------------------------------------------------------------
      if (!(await tableExists(queryInterface, TABLES.PHONEME_ASSESSMENTS))) {
        await queryInterface.createTable(
          TABLES.PHONEME_ASSESSMENTS,
          {
            id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true,
            },
            word_assessment_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: TABLES.WORD_ASSESSMENTS, key: "id" },
              onUpdate: "CASCADE",
              onDelete: "CASCADE",
            },
            expected_symbol: { type: Sequelize.STRING(16), allowNull: true },
            detected_symbol: { type: Sequelize.STRING(16), allowNull: true },
            operation: { type: Sequelize.STRING(20), allowNull: false },
            similarity: { type: Sequelize.DECIMAL(4, 3), allowNull: true },
            changed_features: { type: Sequelize.JSON, allowNull: true },
            ...TIMESTAMP_COLUMNS(Sequelize),
          },
          { transaction },
        );

        await queryInterface.addIndex(TABLES.PHONEME_ASSESSMENTS, {
          fields: ["word_assessment_id"],
          name: "idx_phoneme_assessments_word_assessment",
          transaction,
        });
      }

      // ---------------------------------------------------------------
      // diagnoses — 1:1 with assessments
      // ---------------------------------------------------------------
      if (!(await tableExists(queryInterface, TABLES.DIAGNOSES))) {
        await queryInterface.createTable(
          TABLES.DIAGNOSES,
          {
            id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true,
            },
            assessment_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              unique: true,
              references: { model: TABLES.ASSESSMENTS, key: "id" },
              onUpdate: "CASCADE",
              onDelete: "CASCADE",
            },
            overall_accuracy: {
              type: Sequelize.DECIMAL(5, 2),
              defaultValue: 0,
            },
            cefr_estimate: { type: Sequelize.STRING(10), allowNull: true },
            confidence: { type: Sequelize.DECIMAL(4, 3), allowNull: true },
            strengths: { type: Sequelize.JSON, allowNull: true },
            ...TIMESTAMP_COLUMNS(Sequelize),
          },
          { transaction },
        );
      }

      // ---------------------------------------------------------------
      // learning_needs — 1:N with diagnoses
      // ---------------------------------------------------------------
      if (!(await tableExists(queryInterface, TABLES.LEARNING_NEEDS))) {
        await queryInterface.createTable(
          TABLES.LEARNING_NEEDS,
          {
            id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true,
            },
            diagnosis_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: TABLES.DIAGNOSES, key: "id" },
              onUpdate: "CASCADE",
              onDelete: "CASCADE",
            },
            // LearningNeedType enum value: phoneme, word_stress,
            // sentence_stress, fluency, rhythm, intonation, pause,
            // linking, vocabulary, grammar, listening.
            type: { type: Sequelize.STRING(30), allowNull: false },
            target: { type: Sequelize.STRING(150), allowNull: false },
            occurrences: { type: Sequelize.INTEGER, defaultValue: 0 },
            substitutions: { type: Sequelize.INTEGER, defaultValue: 0 },
            deletions: { type: Sequelize.INTEGER, defaultValue: 0 },
            attributes: { type: Sequelize.JSON, allowNull: true },
            ...TIMESTAMP_COLUMNS(Sequelize),
          },
          { transaction },
        );

        await queryInterface.addIndex(TABLES.LEARNING_NEEDS, {
          fields: ["diagnosis_id"],
          name: "idx_learning_needs_diagnosis",
          transaction,
        });
      }

      // ---------------------------------------------------------------
      // assessment_snapshots — 1:1 with assessments
      // ---------------------------------------------------------------
      if (!(await tableExists(queryInterface, TABLES.ASSESSMENT_SNAPSHOTS))) {
        await queryInterface.createTable(
          TABLES.ASSESSMENT_SNAPSHOTS,
          {
            id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true,
            },
            assessment_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              unique: true,
              references: { model: TABLES.ASSESSMENTS, key: "id" },
              onUpdate: "CASCADE",
              onDelete: "CASCADE",
            },
            raw_payload: { type: Sequelize.JSON, allowNull: false },
            feedback_snapshot: { type: Sequelize.JSON, allowNull: true },
            trace: { type: Sequelize.JSON, allowNull: true },
            ...TIMESTAMP_COLUMNS(Sequelize),
          },
          { transaction },
        );
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Reverse FK-dependency order.
      for (const table of [
        TABLES.ASSESSMENT_SNAPSHOTS,
        TABLES.LEARNING_NEEDS,
        TABLES.DIAGNOSES,
        TABLES.PHONEME_ASSESSMENTS,
        TABLES.WORD_ASSESSMENTS,
        TABLES.ASSESSMENTS,
      ]) {
        if (await tableExists(queryInterface, table)) {
          await queryInterface.dropTable(table, { transaction });
        }
      }
    });
  },
};
