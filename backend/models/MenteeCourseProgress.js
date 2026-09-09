module.exports = (sequelize, DataTypes) => {
  const MenteeCourseProgress = sequelize.define(
    "MenteeCourseProgress",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      mentee_id: { type: DataTypes.INTEGER, allowNull: false },
      course_id: { type: DataTypes.INTEGER, allowNull: false },
      last_active_item_type: {
        type: DataTypes.ENUM("content", "assessment"),
        allowNull: false,
      },
      last_active_item_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: "mentee_course_progress",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  MenteeCourseProgress.associate = (models) => {
    MenteeCourseProgress.belongsTo(models.Mentee, { foreignKey: "mentee_id" });
    MenteeCourseProgress.belongsTo(models.Lesson, { foreignKey: "course_id" });
  };

  return MenteeCourseProgress;
};
