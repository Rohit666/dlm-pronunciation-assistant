const { parseJsonValue } = require("../utils/jsonHelper");

module.exports = (sequelize, DataTypes) => {
  const ExerciseAttemptAnswer = sequelize.define(
    "ExerciseAttemptAnswer",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      exercise_attempt_id: { type: DataTypes.INTEGER, allowNull: false },
      question_id: { type: DataTypes.INTEGER, allowNull: false },
      // Same MariaDB JSON-as-string issue as ExerciseQuestion's
      // content_payload/grading_rubric — proactive fix so a future
      // mentor "review this attempt" screen reading this column back
      // (sentence_formation array, comprehension {sub_answers}) doesn't
      // hit the identical bug.
      student_answer: {
        type: DataTypes.JSON,
        allowNull: true,
        get() {
          return parseJsonValue(this.getDataValue("student_answer"));
        },
      },
      is_correct: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      score_awarded: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
      },
      feedback: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: "exercise_attempt_answers",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  ExerciseAttemptAnswer.associate = (models) => {
    ExerciseAttemptAnswer.belongsTo(models.ExerciseAttempt, {
      foreignKey: "exercise_attempt_id",
    });
    ExerciseAttemptAnswer.belongsTo(models.ExerciseQuestion, {
      foreignKey: "question_id",
    });
  };

  return ExerciseAttemptAnswer;
};
