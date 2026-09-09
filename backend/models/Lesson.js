module.exports = (sequelize, DataTypes) => {
  const Lesson = sequelize.define(
    "Lesson",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      cefr_level: {
        type: DataTypes.STRING(20),
      },

      // Mentor-configured unlock/completion score for this lesson.
      // Nullable — falls back to the lesson's batch, then to a hardcoded
      // 70.00. Resolved in services/progressionService.js.
      passing_score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },

      // Which milestone track this lesson advances a mentee along.
      // 'cefr_level' above stays as the free-text CEFR label for
      // backward-compat display; framework/level_order are what
      // progressionService.js actually reads to increment progress.
      framework: {
        type: DataTypes.ENUM("cefr", "nep_stage"),
        allowNull: false,
        defaultValue: "cefr",
      },

      // 1-indexed position within `framework`'s track (e.g. CEFR A1..C2
      // is 1..6). NULL means this lesson isn't part of a tracked
      // progression — passing it never advances anyone.
      level_order: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      description: {
        type: DataTypes.TEXT,
      },

      thumbnail: {
        type: DataTypes.STRING(255),
      },

      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      lesson_status: {
        type: DataTypes.ENUM("draft", "published", "archived"),

        defaultValue: "draft",
      },
      // DB column is varchar(50), was unbounded STRING before.
      lesson_type: {
        type: DataTypes.STRING(50),
        defaultValue: "sentence_practice",
      },

      // DB column is varchar(20), was unbounded STRING before.
      difficulty_level: {
        type: DataTypes.STRING(20),
        defaultValue: "beginner",
      },

      estimated_duration: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      lesson_outcomes: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      target_skills: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      tableName: "lessons",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );
  Lesson.associate = (models) => {
    Lesson.hasMany(models.LessonSentence, {
      foreignKey: "lesson_id",
    });
    Lesson.hasMany(models.PracticeAttempt, {
      foreignKey: "lesson_id",
    });
  };
  return Lesson;
};
