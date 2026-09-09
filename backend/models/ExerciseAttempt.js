module.exports = (sequelize, DataTypes) => {
  const ExerciseAttempt = sequelize.define(
    "ExerciseAttempt",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      exercise_id: { type: DataTypes.INTEGER, allowNull: false },
      mentee_id: { type: DataTypes.INTEGER, allowNull: false },
      attempt_number: { type: DataTypes.INTEGER, allowNull: false },
      total_score: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
      max_score: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
      percentage: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
      passed: { type: DataTypes.BOOLEAN, allowNull: false },
      submitted_at: { type: DataTypes.DATE, allowNull: false },
    },
    {
      tableName: "exercise_attempts",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  ExerciseAttempt.associate = (models) => {
    ExerciseAttempt.belongsTo(models.LessonExercise, {
      foreignKey: "exercise_id",
    });
    ExerciseAttempt.belongsTo(models.Mentee, { foreignKey: "mentee_id" });
    ExerciseAttempt.hasMany(models.ExerciseAttemptAnswer, {
      foreignKey: "exercise_attempt_id",
      as: "answers",
    });
  };

  return ExerciseAttempt;
};
