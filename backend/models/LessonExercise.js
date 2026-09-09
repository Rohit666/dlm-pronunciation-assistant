module.exports = (sequelize, DataTypes) => {
  const LessonExercise = sequelize.define(
    "LessonExercise",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      lesson_id: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING(255), allowNull: false },
      instructions: { type: DataTypes.TEXT, allowNull: true },
      passing_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 70.0,
      },
      order_index: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    },
    {
      tableName: "lesson_exercises",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  LessonExercise.associate = (models) => {
    LessonExercise.belongsTo(models.Lesson, { foreignKey: "lesson_id" });
    LessonExercise.hasMany(models.ExerciseQuestion, {
      foreignKey: "exercise_id",
      as: "questions",
    });
    LessonExercise.hasMany(models.ExerciseAttempt, { foreignKey: "exercise_id" });
  };

  return LessonExercise;
};
