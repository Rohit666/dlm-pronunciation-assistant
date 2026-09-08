"use strict";

/**
 * Part 1 schema addition + phoneme aggregate table.
 *
 * Additive-only, non-destructive, idempotent, transaction-wrapped —
 * same pattern as 20260904130000-schema-reconciliation-fk-index-audit.js.
 *
 * REVISION NOTE: this migration originally also created a
 * `lesson_attempts` table for AI-scored practice tries. That design
 * was reviewed against the real schema (practice_attempts already
 * being the macro attempt container, practice_sessions already being
 * the sentence-level submission log) and found redundant with what
 * practice_sessions should own instead. lesson_attempts has been
 * removed from this migration; the replacement normalized assessment
 * schema (assessments / word_assessments / phoneme_assessments /
 * diagnoses / learning_needs / assessment_snapshots, all hanging off
 * practice_sessions) lives in
 * 20260907120000-normalized-assessment-schema.js, which also drops
 * `lesson_attempts` defensively in case this file was already run
 * before the revision.
 *
 * 1. lesson_sentences.content_blocks (JSON) — modular block hierarchy
 *    (main_text / sub_text + attachments). Legacy sentence_text /
 *    audio_path / image_path / video_path columns are KEPT (never
 *    dropped) and backfilled into content_blocks for existing rows,
 *    then kept in sync going forward by the controller so any code
 *    still reading the legacy columns (e.g. compare's reference text)
 *    keeps working.
 *
 * 2. student_phoneme_stats — new table. Per-mentee per-phoneme
 *    aggregate (total_attempts / weak_count), upserted transactionally
 *    on official submission (see practiceController.submit).
 */

const CONTENT_BLOCKS_COLUMN = "content_blocks";
const LESSON_SENTENCES_TABLE = "lesson_sentences";
const PHONEME_STATS_TABLE = "student_phoneme_stats";

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
      // 1. lesson_sentences.content_blocks
      // ---------------------------------------------------------------
      const hasContentBlocks = await columnExists(
        queryInterface,
        LESSON_SENTENCES_TABLE,
        CONTENT_BLOCKS_COLUMN,
      );

      if (!hasContentBlocks) {
        await queryInterface.addColumn(
          LESSON_SENTENCES_TABLE,
          CONTENT_BLOCKS_COLUMN,
          {
            type: Sequelize.JSON,
            allowNull: true,
          },
          { transaction },
        );
      }

      // Backfill: any row with content_blocks still NULL gets a single
      // main_text block built from its legacy columns, so the new
      // block-builder UI has something to render for existing sentences.
      const [legacyRows] = await queryInterface.sequelize.query(
        `SELECT id, sentence_text, audio_path, image_path, video_path
         FROM \`${LESSON_SENTENCES_TABLE}\`
         WHERE \`${CONTENT_BLOCKS_COLUMN}\` IS NULL`,
        { transaction },
      );

      for (const row of legacyRows) {
        const attachments = [];
        if (row.audio_path) {
          attachments.push({ type: "audio", file_path: row.audio_path });
        }
        if (row.image_path) {
          attachments.push({ type: "image", file_path: row.image_path });
        }
        if (row.video_path) {
          attachments.push({ type: "video", file_path: row.video_path });
        }

        const blocks = [
          {
            id: `block-${row.id}-main`,
            type: "main_text",
            text: row.sentence_text || "",
            order: 1,
            attachments,
          },
        ];

        await queryInterface.sequelize.query(
          `UPDATE \`${LESSON_SENTENCES_TABLE}\`
           SET \`${CONTENT_BLOCKS_COLUMN}\` = :blocks
           WHERE id = :id`,
          {
            replacements: { blocks: JSON.stringify(blocks), id: row.id },
            transaction,
          },
        );
      }

      // ---------------------------------------------------------------
      // 2. student_phoneme_stats
      // ---------------------------------------------------------------
      const phonemeStatsTableExists = await tableExists(
        queryInterface,
        PHONEME_STATS_TABLE,
      );

      if (!phonemeStatsTableExists) {
        await queryInterface.createTable(
          PHONEME_STATS_TABLE,
          {
            id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true,
            },
            mentee_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: "mentees", key: "id" },
              onUpdate: "CASCADE",
              onDelete: "CASCADE",
            },
            phoneme: {
              type: Sequelize.STRING(16),
              allowNull: false,
            },
            total_attempts: {
              type: Sequelize.INTEGER,
              allowNull: false,
              defaultValue: 0,
            },
            weak_count: {
              type: Sequelize.INTEGER,
              allowNull: false,
              defaultValue: 0,
            },
            last_seen_at: {
              type: Sequelize.DATE,
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

        await queryInterface.addIndex(PHONEME_STATS_TABLE, {
          fields: ["mentee_id", "phoneme"],
          unique: true,
          name: "uniq_student_phoneme_stats_mentee_phoneme",
          transaction,
        });
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      if (await tableExists(queryInterface, PHONEME_STATS_TABLE)) {
        await queryInterface.dropTable(PHONEME_STATS_TABLE, { transaction });
      }
      if (
        await columnExists(
          queryInterface,
          LESSON_SENTENCES_TABLE,
          CONTENT_BLOCKS_COLUMN,
        )
      ) {
        await queryInterface.removeColumn(
          LESSON_SENTENCES_TABLE,
          CONTENT_BLOCKS_COLUMN,
          { transaction },
        );
      }
    });
  },
};
