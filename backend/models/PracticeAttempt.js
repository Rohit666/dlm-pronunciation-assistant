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
        references: {
          model: "mentees",
          key: "id",
        },
      },

      lesson_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "lessons",
          key: "id",
        },
      },

      status: {
        type: DataTypes.ENUM("in_progress", "submitted"),
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
        allowNull: true,
      },
      // DB column is TEXT, not varchar(255) — mentor feedback in
      // ReviewAttemptPage.jsx is a multi-line textarea, easily over 255 chars.
      overall_feedback: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      review_status: {
        type: DataTypes.ENUM("pending", "reviewed"),
        defaultValue: "pending",
      },
      reviewed_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
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
