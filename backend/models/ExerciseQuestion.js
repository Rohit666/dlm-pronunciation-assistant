const { parseJsonValue } = require("../utils/jsonHelper");

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
      // Explicit getter: on MariaDB, JSON is a LONGTEXT+CHECK(json_valid())
      // alias, not a native JSON column type, so mysql2 never auto-parses
      // it and Sequelize hands back the raw string — silently breaking
      // both the mentor answer-key view AND exerciseEvaluationService's
      // grading (rubric.correct_option_id etc. read off a string is
      // always undefined, so mcq/true_false/fill_blank/sentence_formation/
      // comprehension were all being marked wrong regardless of the
      // mentee's actual answer). parseJsonValue is a no-op on real MySQL,
      // where the driver already hands back a parsed object.
      content_payload: {
        type: DataTypes.JSON,
        allowNull: true,
        get() {
          return parseJsonValue(this.getDataValue("content_payload"));
        },
      },
      // Never leaves the server for a mentee — exerciseController strips
      // it in getLessonExercises for role="mentee". Same MariaDB
      // string-vs-object issue as content_payload above.
      grading_rubric: {
        type: DataTypes.JSON,
        allowNull: true,
        get() {
          return parseJsonValue(this.getDataValue("grading_rubric"));
        },
      },
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
