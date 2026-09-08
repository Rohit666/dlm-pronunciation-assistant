module.exports = (sequelize, DataTypes) => {
  const Assessment = sequelize.define(
    "Assessment",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      practice_session_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },

      overall_accuracy: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
      total_reference: { type: DataTypes.INTEGER, defaultValue: 0 },
      exact_matches: { type: DataTypes.INTEGER, defaultValue: 0 },
      substitutions: { type: DataTypes.INTEGER, defaultValue: 0 },
      insertions: { type: DataTypes.INTEGER, defaultValue: 0 },
      deletions: { type: DataTypes.INTEGER, defaultValue: 0 },

      recognition_state: { type: DataTypes.STRING(20), allowNull: true },
      recognition_success: { type: DataTypes.BOOLEAN, defaultValue: true },
      recognized_words: { type: DataTypes.INTEGER, defaultValue: 0 },
      total_words: { type: DataTypes.INTEGER, defaultValue: 0 },
      expected_text: { type: DataTypes.TEXT, allowNull: true },
      detected_text: { type: DataTypes.TEXT, allowNull: true },
      transcript: { type: DataTypes.TEXT, allowNull: true },

      // The student's chosen/official submission for that sentence.
      is_accepted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "assessments",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  Assessment.associate = (models) => {
    Assessment.belongsTo(models.PracticeSession, {
      foreignKey: "practice_session_id",
    });
    Assessment.hasMany(models.WordAssessment, {
      foreignKey: "assessment_id",
      as: "words",
    });
    Assessment.hasOne(models.Diagnosis, {
      foreignKey: "assessment_id",
    });
    Assessment.hasOne(models.AssessmentSnapshot, {
      foreignKey: "assessment_id",
    });
  };

  return Assessment;
};
