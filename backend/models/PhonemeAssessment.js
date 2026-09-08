module.exports = (sequelize, DataTypes) => {
  const PhonemeAssessment = sequelize.define(
    "PhonemeAssessment",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      word_assessment_id: { type: DataTypes.INTEGER, allowNull: false },

      expected_symbol: { type: DataTypes.STRING(16), allowNull: true },
      detected_symbol: { type: DataTypes.STRING(16), allowNull: true },
      operation: { type: DataTypes.STRING(20), allowNull: false },
      similarity: { type: DataTypes.DECIMAL(4, 3), allowNull: true },
      changed_features: { type: DataTypes.JSON, allowNull: true },
    },
    {
      tableName: "phoneme_assessments",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  PhonemeAssessment.associate = (models) => {
    PhonemeAssessment.belongsTo(models.WordAssessment, {
      foreignKey: "word_assessment_id",
    });
  };

  return PhonemeAssessment;
};
