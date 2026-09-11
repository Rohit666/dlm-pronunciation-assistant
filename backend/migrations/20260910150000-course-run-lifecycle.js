"use strict";

/**
 * Course Run lifecycle — fixes a real progression bug: "Resume Practice"
 * / "Practice Again" completion checks read `exercise_attempts`/
 * `practice_attempts` (via `assessments.is_accepted`) with NO scoping to
 * "this pass through the course" at all. A mentee who already attempted
 * an exercise on a PRIOR pass has that attempt count as satisfying
 * progression on every future pass forever, so a fresh "Practice Again"
 * run silently inherits old submissions and the stream engine skips
 * straight to steps the mentee hasn't actually done this time — up to
 * and including the Course Completed screen.
 *
 * `course_runs` is the missing container: one row per (mentee, course,
 * run_number) "pass" through the course. `practice_attempts.course_run_id`
 * and `exercise_attempts.course_run_id` (both nullable — see below) let
 * completion be scored against THIS run only.
 *
 * Same idempotent (`tableExists`/`columnExists` + transaction) convention
 * as every prior migration in this repo.
 */

const COURSE_RUNS_TABLE = "course_runs";
const MENTEES_TABLE = "mentees";
const LESSONS_TABLE = "lessons";
const PRACTICE_ATTEMPTS_TABLE = "practice_attempts";
const EXERCISE_ATTEMPTS_TABLE = "exercise_attempts";

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
      // course_runs
      // ---------------------------------------------------------------
      if (!(await tableExists(queryInterface, COURSE_RUNS_TABLE))) {
        await queryInterface.createTable(
          COURSE_RUNS_TABLE,
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
            run_number: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
            status: {
              type: Sequelize.ENUM("in_progress", "completed", "abandoned"),
              allowNull: false,
              defaultValue: "in_progress",
            },
            current_step_index: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            total_steps: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            started_at: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            completed_at: { type: Sequelize.DATE, allowNull: true },
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

        await queryInterface.addIndex(COURSE_RUNS_TABLE, {
          fields: ["mentee_id", "course_id"],
          name: "idx_course_runs_mentee_course",
          transaction,
        });
        await queryInterface.addIndex(COURSE_RUNS_TABLE, {
          fields: ["status"],
          name: "idx_course_runs_status",
          transaction,
        });
      }

      // ---------------------------------------------------------------
      // practice_attempts.course_run_id — nullable: a pre-migration
      // attempt has no run to point at (see backfill below, not a
      // silent gap).
      // ---------------------------------------------------------------
      if (!(await columnExists(queryInterface, PRACTICE_ATTEMPTS_TABLE, "course_run_id"))) {
        await queryInterface.addColumn(
          PRACTICE_ATTEMPTS_TABLE,
          "course_run_id",
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: { model: COURSE_RUNS_TABLE, key: "id" },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
            after: "lesson_id",
          },
          { transaction },
        );
        await queryInterface.addIndex(PRACTICE_ATTEMPTS_TABLE, {
          fields: ["course_run_id"],
          name: "idx_practice_attempts_course_run_id",
          transaction,
        });
      }

      // ---------------------------------------------------------------
      // exercise_attempts.course_run_id — same rationale.
      // ---------------------------------------------------------------
      if (!(await columnExists(queryInterface, EXERCISE_ATTEMPTS_TABLE, "course_run_id"))) {
        await queryInterface.addColumn(
          EXERCISE_ATTEMPTS_TABLE,
          "course_run_id",
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: { model: COURSE_RUNS_TABLE, key: "id" },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
            after: "exercise_id",
          },
          { transaction },
        );
        await queryInterface.addIndex(EXERCISE_ATTEMPTS_TABLE, {
          fields: ["course_run_id"],
          name: "idx_exercise_attempts_course_run_id",
          transaction,
        });
      }

      // ---------------------------------------------------------------
      // Backfill — disclosed judgment call, not a full reconstruction.
      //
      // Without this, every mentee with pre-migration history would see
      // their course reset to step 0 on next load: getOrCreateActiveRun
      // finds no `course_runs` row at all, mints run_number 1, and every
      // activityRegistry completion check is scoped to that brand-new
      // run's id — none of which any existing attempt row carries, since
      // they all have course_run_id = NULL.
      //
      // One legacy `course_runs` row is created per (mentee, course)
      // pair that has ANY existing practice_attempts or exercise_attempts,
      // status = 'completed' (closed, not the active run), and every
      // existing attempt for that pair is backfilled to point at it.
      // This is NOT a reconstruction of what actually happened across
      // however many real historical passes — it collapses all
      // pre-migration history into one closed "legacy" run per course so
      // it stops counting toward a NEW run's progression (the actual bug
      // this migration fixes) while staying queryable/attributable. A
      // mentee with a genuinely still-open `practice_attempts` row at
      // migration time keeps that row's own `status = 'in_progress'`
      // (untouched) but it now belongs to a 'completed' run — the next
      // "Resume Practice" mints a fresh run_number 2 and the mentee
      // re-does whichever sentences that in-progress attempt hadn't yet
      // gotten accepted. No live database exists in this sandbox to run
      // this against, so this is a documented judgment call, not a
      // verified migration.
      // ---------------------------------------------------------------
      const [pairs] = await queryInterface.sequelize.query(
        `
        SELECT mentee_id, lesson_id AS course_id, MIN(started_at) AS started_at
        FROM (
          SELECT mentee_id, lesson_id, started_at FROM practice_attempts
          UNION ALL
          SELECT ea.mentee_id, le.lesson_id, ea.created_at AS started_at
          FROM exercise_attempts ea
          INNER JOIN lesson_exercises le ON le.id = ea.exercise_id
        ) legacy
        GROUP BY mentee_id, lesson_id
        `,
        { transaction },
      );

      for (const pair of pairs) {
        const [inserted] = await queryInterface.sequelize.query(
          `
          INSERT INTO course_runs
            (mentee_id, course_id, run_number, status, current_step_index, total_steps, started_at, completed_at, created_at, updated_at)
          VALUES
            (:menteeId, :courseId, 1, 'completed', 0, 0, :startedAt, NOW(), NOW(), NOW())
          `,
          {
            replacements: {
              menteeId: pair.mentee_id,
              courseId: pair.course_id,
              startedAt: pair.started_at,
            },
            transaction,
          },
        );
        const legacyRunId = inserted;

        await queryInterface.sequelize.query(
          `UPDATE practice_attempts SET course_run_id = :runId WHERE mentee_id = :menteeId AND lesson_id = :courseId AND course_run_id IS NULL`,
          { replacements: { runId: legacyRunId, menteeId: pair.mentee_id, courseId: pair.course_id }, transaction },
        );
        await queryInterface.sequelize.query(
          `
          UPDATE exercise_attempts ea
          INNER JOIN lesson_exercises le ON le.id = ea.exercise_id
          SET ea.course_run_id = :runId
          WHERE ea.mentee_id = :menteeId AND le.lesson_id = :courseId AND ea.course_run_id IS NULL
          `,
          { replacements: { runId: legacyRunId, menteeId: pair.mentee_id, courseId: pair.course_id }, transaction },
        );
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      if (await columnExists(queryInterface, EXERCISE_ATTEMPTS_TABLE, "course_run_id")) {
        await queryInterface.removeColumn(EXERCISE_ATTEMPTS_TABLE, "course_run_id", { transaction });
      }
      if (await columnExists(queryInterface, PRACTICE_ATTEMPTS_TABLE, "course_run_id")) {
        await queryInterface.removeColumn(PRACTICE_ATTEMPTS_TABLE, "course_run_id", { transaction });
      }
      if (await tableExists(queryInterface, COURSE_RUNS_TABLE)) {
        await queryInterface.dropTable(COURSE_RUNS_TABLE, { transaction });
      }
    });
  },
};
