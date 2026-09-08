module.exports = (sequelize, DataTypes) => {
  const Diagnosis = sequelize.define(
    "Diagnosis",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      assessment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },

      overall_accuracy: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
      cefr_estimate: { type: DataTypes.STRING(10), allowNull: true },
      confidence: { type: DataTypes.DECIMAL(4, 3), allowNull: true },
      strengths: { type: DataTypes.JSON, allowNull: true },
    },
    {
      tableName: "diagnoses",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  Diagnosis.associate = (models) => {
    Diagnosis.belongsTo(models.Assessment, {
      foreignKey: "assessment_id",
    });
    Diagnosis.hasMany(models.LearningNeed, {
      foreignKey: "diagnosis_id",
      as: "needs",
    });
  };

  return Diagnosis;
};
