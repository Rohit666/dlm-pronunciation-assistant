module.exports = (sequelize, DataTypes) => {
  const CourseRun = sequelize.define(
    "CourseRun",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      mentee_id: { type: DataTypes.INTEGER, allowNull: false },
      course_id: { type: DataTypes.INTEGER, allowNull: false },

      run_number: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },

      status: {
        type: DataTypes.ENUM("in_progress", "completed", "abandoned"),
        allowNull: false,
        defaultValue: "in_progress",
      },

      current_step_index: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      total_steps: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

      started_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      completed_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "course_runs",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  CourseRun.associate = (models) => {
    CourseRun.belongsTo(models.Mentee, { foreignKey: "mentee_id", as: "mentee" });
    CourseRun.belongsTo(models.Lesson, { foreignKey: "course_id", as: "course" });
    CourseRun.hasMany(models.PracticeAttempt, {
      foreignKey: "course_run_id",
      as: "practice_attempts",
    });
    CourseRun.hasMany(models.ExerciseAttempt, {
      foreignKey: "course_run_id",
      as: "exercise_attempts",
    });
  };

  return CourseRun;
};
