// One row per KEPT progressive try (Progressive Filter Rule — strictly
// beats every score already logged for its practice_session). Deliberately
// narrow: no ai_payload/word/phoneme breakdown here, that lives in
// assessments/word_assessments/phoneme_assessments once a try is actually
// submitted. This is trajectory data only — see practiceSessionTryService.js.
module.exports = (sequelize, DataTypes) => {
  const PracticeSessionTry = sequelize.define(
    "PracticeSessionTry",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      practice_session_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      try_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      overall_score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
    },
    {
      tableName: "practice_session_tries",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  PracticeSessionTry.associate = (models) => {
    PracticeSessionTry.belongsTo(models.PracticeSession, {
      foreignKey: "practice_session_id",
    });
  };

  return PracticeSessionTry;
};
