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

      description: {
        type: DataTypes.TEXT,
      },

      thumbnail: {
        type: DataTypes.STRING(255),
      },

      created_by: {
        type: DataTypes.INTEGER,
      },
      lesson_status: {
        type: DataTypes.ENUM("draft", "published", "archived"),

        defaultValue: "draft",
      },
      lesson_type: {
        type: DataTypes.STRING,
        defaultValue: "sentence_practice",
      },

      difficulty_level: {
        type: DataTypes.STRING,
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
    Lesson.hasMany(models.LessonExercise, {
      foreignKey: "lesson_id",
    });
  };
  return Lesson;
};
