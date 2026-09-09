module.exports = (sequelize, DataTypes) => {
  const ExerciseQuestion = sequelize.define(
    "ExerciseQuestion",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      exercise_id: { type: DataTypes.INTEGER, allowNull: false },
      question_type: {
        type: DataTypes.ENUM(
          "mcq",
          "true_false",
          "fill_blank",
          "sentence_formation",
          "comprehension",
          "paragraph",
        ),
        allowNull: false,
      },
      prompt: { type: DataTypes.TEXT, allowNull: false },
      // Shape depends on question_type — see exerciseEvaluationService.js.
      content_payload: { type: DataTypes.JSON, allowNull: true },
      // Never leaves the server for a mentee — exerciseController strips
      // it in getLessonExercises for role="mentee".
      grading_rubric: { type: DataTypes.JSON, allowNull: true },
      points: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      order_index: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    },
    {
      tableName: "exercise_questions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  ExerciseQuestion.associate = (models) => {
    ExerciseQuestion.belongsTo(models.LessonExercise, {
      foreignKey: "exercise_id",
    });
    ExerciseQuestion.hasMany(models.ExerciseAttemptAnswer, {
      foreignKey: "question_id",
    });
  };

  return ExerciseQuestion;
};
