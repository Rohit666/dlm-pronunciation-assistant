module.exports = (sequelize, DataTypes) => {
  const PracticeAttempt = sequelize.define(
    "PracticeAttempt",
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

      lesson_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM("in_progress", "submtted"),
        defaultValue: "in_progress",
      },

      current_sentence_order: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },

      attempt_number: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      overall_score: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.0,
        allowNull: true,
      },
      overall_feedback: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      review_status: {
        type: DataTypes.ENUM("pending", "reviewed"),
        defaultValue: "pending",
      },
      reviewed_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      reviewed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      first_reviewed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      started_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },

      completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "practice_attempts",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  PracticeAttempt.associate = (models) => {
    PracticeAttempt.belongsTo(models.Mentee, {
      foreignKey: "mentee_id",
    });

    PracticeAttempt.belongsTo(models.Lesson, {
      foreignKey: "lesson_id",
    });

    PracticeAttempt.hasMany(models.PracticeSession, {
      foreignKey: "practice_attempt_id",
    });
  };

  return PracticeAttempt;
};
