module.exports = (sequelize, DataTypes) => {
  const AssessmentSnapshot = sequelize.define(
    "AssessmentSnapshot",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      assessment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },

      // Verbatim ai-runtime SpeechAssessmentResponse JSON, for audit —
      // includes the sentence-wide phoneme_comparison that
      // phoneme_assessments does not duplicate (see migration header).
      raw_payload: { type: DataTypes.JSON, allowNull: false },
      feedback_snapshot: { type: DataTypes.JSON, allowNull: true },
      trace: { type: DataTypes.JSON, allowNull: true },
    },
    {
      tableName: "assessment_snapshots",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  AssessmentSnapshot.associate = (models) => {
    AssessmentSnapshot.belongsTo(models.Assessment, {
      foreignKey: "assessment_id",
    });
  };

  return AssessmentSnapshot;
};
