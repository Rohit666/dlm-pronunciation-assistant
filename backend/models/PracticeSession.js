module.exports = (sequelize, DataTypes) => {
  const PracticeSession = sequelize.define(
    "PracticeSession",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      mentee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "mentees",
          key: "id",
        },
      },

      lesson_sentence_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "lesson_sentences",
          key: "id",
        },
      },
      practice_attempt_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "practice_attempts",
          key: "id",
        },
      },
      // DB column is TEXT, not varchar(255) — full absolute paths
      // (seen in ai-runtime test fixtures: "D:/dlm-pronunciation-assistant/...")
      // can exceed 255 chars. Was STRING(255) before, mismatched.
      recording_path: {
        type: DataTypes.TEXT,
      },

      // DB default is NULL (no default), not 0.0. A freshly created
      // session should read as "not yet scored", not "scored zero".
      score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },

      feedback: {
        type: DataTypes.TEXT,
      },
      // Existed in the DB dump already (enum('started','completed',
      // 'review_pending') default 'started') but was entirely absent
      // from this model — no controller could read or transition it.
      // Added so it's queryable; wiring up the actual transitions
      // (submit -> completed, mentor review -> review_pending) is an
      // app-logic change, not a schema one.
      status: {
        type: DataTypes.ENUM("started", "completed", "review_pending"),
        defaultValue: "started",
      },
      reviewed_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      // Column already existed in the DB. Model never declared it
      // (previously via the invalid option `reviewedAt: "reviewed_at"`,
      // not real Sequelize syntax), so mentorReviewController's writes
      // to it were silently dropped by the ORM even though the column
      // was there the whole time.
      reviewed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "practice_sessions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );
  PracticeSession.associate = (models) => {
    PracticeSession.belongsTo(models.Mentee, {
      foreignKey: "mentee_id",
    });
    PracticeSession.belongsTo(models.LessonSentence, {
      foreignKey: "lesson_sentence_id",
    });
    PracticeSession.belongsTo(models.PracticeAttempt, {
      foreignKey: "practice_attempt_id",
    });
  };
  return PracticeSession;
};
