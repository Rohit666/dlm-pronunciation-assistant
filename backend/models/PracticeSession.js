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
      // added while wiring the normalized assessment submit flow,
      // which sets it to "completed" once an Assessment is attached.
      status: {
        type: DataTypes.ENUM("started", "completed", "review_pending"),
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
  };
  return PracticeSession;
};
