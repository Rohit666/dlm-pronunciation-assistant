module.exports = (sequelize, DataTypes) => {
  const Topic = sequelize.define(
    "Topic",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      course_id: { type: DataTypes.INTEGER, allowNull: false },
      // NULL = root topic (direct child of the course itself).
      parent_id: { type: DataTypes.INTEGER, allowNull: true },
      title: { type: DataTypes.STRING(255), allowNull: false },
      order_index: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    },
    {
      tableName: "topics",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  Topic.associate = (models) => {
    Topic.belongsTo(models.Lesson, { foreignKey: "course_id", as: "course" });
    Topic.belongsTo(models.Topic, { foreignKey: "parent_id", as: "parent" });
    Topic.hasMany(models.Topic, { foreignKey: "parent_id", as: "children" });
    Topic.hasMany(models.LessonSentence, { foreignKey: "topic_id", as: "contents" });
    Topic.hasMany(models.LessonExercise, { foreignKey: "topic_id", as: "assessments" });
  };

  return Topic;
};
