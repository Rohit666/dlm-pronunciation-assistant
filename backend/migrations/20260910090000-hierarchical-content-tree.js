"use strict";

/**
 * Hierarchical Learning Content Tree.
 *
 * Adjacency-list tree layered ON TOP of the existing flat schema rather
 * than a rename of it. `lessons` already IS the course entity — every
 * other subsystem shipped this session (CEFR progression, adaptive
 * recommendations, the exercise engine, mentor review) reads/writes
 * `lesson_id` across a few dozen files. Renaming `lessons` -> `courses`
 * would touch all of that for a purely cosmetic gain and break every
 * FK in one migration; treated as out of scope for this pass — see the
 * delivery notes for the explicit call-out. `lessons` plays the role of
 * "course" everywhere below.
 *
 * New:
 *   topics                — self-referencing (parent_id -> topics.id),
 *                           course_id -> lessons.id. parent_id IS NULL
 *                           marks a root topic; arbitrary depth below that.
 *   mentee_course_progress — one row per (mentee, course): resume pointer
 *                           (last_active_item_type/id) into the linearized
 *                           play stream (see courseStreamService.js).
 *
 * Additive columns:
 *   lesson_sentences.topic_id  — nullable FK -> topics.id, SET NULL on
 *                                 delete (content reverts to course root
 *                                 rather than vanishing if its topic is
 *                                 removed).
 *   lesson_exercises.topic_id  — same.
 *
 * Idempotent (tableExists/columnExists) + transaction-wrapped, matching
 * every prior migration in this repo.
 */

const LESSONS_TABLE = "lessons";
const MENTEES_TABLE = "mentees";
const TOPICS_TABLE = "topics";
const LESSON_SENTENCES_TABLE = "lesson_sentences";
const LESSON_EXERCISES_TABLE = "lesson_exercises";
const MENTEE_COURSE_PROGRESS_TABLE = "mentee_course_progress";

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

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // ---------------------------------------------------------------
      // topics
      // ---------------------------------------------------------------
      if (!(await tableExists(queryInterface, TOPICS_TABLE))) {
        await queryInterface.createTable(
          TOPICS_TABLE,
          {
            id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
            course_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: LESSONS_TABLE, key: "id" },
              onUpdate: "CASCADE",
              onDelete: "CASCADE",
            },
            // NULL = root topic (direct child of the course). Non-null =
            // nested sub-topic, arbitrary depth. Self-FK CASCADE means
            // deleting a topic deletes its whole sub-tree.
            parent_id: {
              type: Sequelize.INTEGER,
              allowNull: true,
              references: { model: TOPICS_TABLE, key: "id" },
              onUpdate: "CASCADE",
              onDelete: "CASCADE",
            },
            title: { type: Sequelize.STRING(255), allowNull: false },
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

        await queryInterface.addIndex(TOPICS_TABLE, {
          fields: ["course_id"],
          name: "idx_topics_course_id",
          transaction,
        });
        await queryInterface.addIndex(TOPICS_TABLE, {
          fields: ["parent_id"],
          name: "idx_topics_parent_id",
          transaction,
        });
      }

      // ---------------------------------------------------------------
      // lesson_sentences.topic_id
      // ---------------------------------------------------------------
      if (!(await columnExists(queryInterface, LESSON_SENTENCES_TABLE, "topic_id"))) {
        await queryInterface.addColumn(
          LESSON_SENTENCES_TABLE,
          "topic_id",
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: { model: TOPICS_TABLE, key: "id" },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
          },
          { transaction },
        );
        await queryInterface.addIndex(LESSON_SENTENCES_TABLE, {
          fields: ["topic_id"],
          name: "idx_lesson_sentences_topic_id",
          transaction,
        });
      }

      // ---------------------------------------------------------------
      // lesson_exercises.topic_id
      // ---------------------------------------------------------------
      if (!(await columnExists(queryInterface, LESSON_EXERCISES_TABLE, "topic_id"))) {
        await queryInterface.addColumn(
          LESSON_EXERCISES_TABLE,
          "topic_id",
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: { model: TOPICS_TABLE, key: "id" },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
          },
          { transaction },
        );
        await queryInterface.addIndex(LESSON_EXERCISES_TABLE, {
          fields: ["topic_id"],
          name: "idx_lesson_exercises_topic_id",
          transaction,
        });
      }

      // ---------------------------------------------------------------
      // mentee_course_progress — resume pointer into the linearized
      // play stream (courseStreamService.getCoursePlayStream).
      // ---------------------------------------------------------------
      if (!(await tableExists(queryInterface, MENTEE_COURSE_PROGRESS_TABLE))) {
        await queryInterface.createTable(
          MENTEE_COURSE_PROGRESS_TABLE,
          {
            id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
            mentee_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: MENTEES_TABLE, key: "id" },
              onUpdate: "CASCADE",
              onDelete: "CASCADE",
            },
            course_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: LESSONS_TABLE, key: "id" },
              onUpdate: "CASCADE",
              onDelete: "CASCADE",
            },
            last_active_item_type: {
              type: Sequelize.ENUM("content", "assessment"),
              allowNull: false,
            },
            last_active_item_id: { type: Sequelize.INTEGER, allowNull: false },
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

        await queryInterface.addIndex(MENTEE_COURSE_PROGRESS_TABLE, {
          fields: ["mentee_id", "course_id"],
          unique: true,
          name: "uniq_mentee_course_progress_mentee_course",
          transaction,
        });
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      if (await tableExists(queryInterface, MENTEE_COURSE_PROGRESS_TABLE)) {
        await queryInterface.dropTable(MENTEE_COURSE_PROGRESS_TABLE, { transaction });
      }
      if (await columnExists(queryInterface, LESSON_EXERCISES_TABLE, "topic_id")) {
        await queryInterface.removeColumn(LESSON_EXERCISES_TABLE, "topic_id", { transaction });
      }
      if (await columnExists(queryInterface, LESSON_SENTENCES_TABLE, "topic_id")) {
        await queryInterface.removeColumn(LESSON_SENTENCES_TABLE, "topic_id", { transaction });
      }
      if (await tableExists(queryInterface, TOPICS_TABLE)) {
        await queryInterface.dropTable(TOPICS_TABLE, { transaction });
      }
    });
  },
};
