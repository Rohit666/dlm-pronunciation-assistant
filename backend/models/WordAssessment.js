module.exports = (sequelize, DataTypes) => {
  const WordAssessment = sequelize.define(
    "WordAssessment",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      assessment_id: { type: DataTypes.INTEGER, allowNull: false },

      word_index: { type: DataTypes.INTEGER, allowNull: false },
      expected_word: { type: DataTypes.STRING(255), allowNull: false },

      // Python's WordAssessment.student_word, mapped to detected_word by
      // assessmentAdapter.js before this reaches Sequelize.
      detected_word: { type: DataTypes.STRING(255), allowNull: true },

      operation: { type: DataTypes.STRING(20), allowNull: false },
      accepted: { type: DataTypes.BOOLEAN, defaultValue: false },
      confidence: { type: DataTypes.DECIMAL(4, 3), allowNull: true },
      accuracy: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
      weak_phonemes: { type: DataTypes.JSON, allowNull: true },
    },
    {
      tableName: "word_assessments",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  WordAssessment.associate = (models) => {
    WordAssessment.belongsTo(models.Assessment, {
      foreignKey: "assessment_id",
    });
    WordAssessment.hasMany(models.PhonemeAssessment, {
      foreignKey: "word_assessment_id",
      as: "phonemes",
    });
  };

  return WordAssessment;
};
