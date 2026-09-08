module.exports = (sequelize, DataTypes) => {
  const LearningNeed = sequelize.define(
    "LearningNeed",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      diagnosis_id: { type: DataTypes.INTEGER, allowNull: false },

      // phoneme | word_stress | sentence_stress | fluency | rhythm |
      // intonation | pause | linking | vocabulary | grammar | listening
      type: { type: DataTypes.STRING(30), allowNull: false },
      target: { type: DataTypes.STRING(150), allowNull: false },
      occurrences: { type: DataTypes.INTEGER, defaultValue: 0 },
      substitutions: { type: DataTypes.INTEGER, defaultValue: 0 },
      deletions: { type: DataTypes.INTEGER, defaultValue: 0 },
      attributes: { type: DataTypes.JSON, allowNull: true },
    },
    {
      tableName: "learning_needs",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  LearningNeed.associate = (models) => {
    LearningNeed.belongsTo(models.Diagnosis, {
      foreignKey: "diagnosis_id",
    });
  };

  return LearningNeed;
};
