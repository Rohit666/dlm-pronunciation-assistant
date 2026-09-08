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
      },

      lesson_sentence_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      practice_attempt_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      recording_path: {
        type: DataTypes.STRING(255),
      },

      score: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.0,
      },

      feedback: {
        type: DataTypes.TEXT,
      },
      reviewed_by: {
        type: DataTypes.INTEGER,
      },

      // Present in the real DB dump but was missing from this model —
      // added while wiring the normalized assessment submit flow. A row
      // is created at the FIRST /compare call for a (mentee,
      // lesson_sentence, practice_attempt) tuple as "started", and
      // flipped to "submitted" once an Assessment is attached at
      // /submit. "completed" is kept in the enum for backward
      // compatibility only — nothing writes it going forward.
      status: {
        type: DataTypes.ENUM(
          "started",
          "completed",
          "review_pending",
          "submitted",
        ),
        defaultValue: "started",
      },
    },
    {
      tableName: "practice_sessions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      reviewedAt: "reviewed_at",
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
    PracticeSession.hasOne(models.Assessment, {
      foreignKey: "practice_session_id",
    });
    PracticeSession.hasMany(models.PracticeSessionTry, {
      foreignKey: "practice_session_id",
    });
  };
  return PracticeSession;
};
