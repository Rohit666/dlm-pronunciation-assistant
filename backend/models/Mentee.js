module.exports = (sequelize, DataTypes) => {
  const Mentee = sequelize.define(
    "Mentee",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      batch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      roll_number: {
        type: DataTypes.STRING(50),
      },

      // Requirement 1.1 (self-paced progression): the CEFR level this
      // mentee is unlocked through. Advances via progressionService once
      // every published lesson at the current level has a submitted
      // attempt scoring >= PASS_THRESHOLD — never on mentor review.
      current_cefr_level: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "A1",
      },
    },
    {
      tableName: "mentees",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );
  Mentee.associate = (models) => {
    Mentee.belongsTo(models.User, {
      foreignKey: "user_id",
    });
    Mentee.belongsTo(models.Batch, {
      foreignKey: "batch_id",
    });
    Mentee.hasMany(models.PracticeSession, {
      foreignKey: "mentee_id",
    });
    Mentee.hasMany(models.PracticeAttempt, {
      foreignKey: "mentee_id",
    });
    Mentee.hasMany(models.StudentPhonemeStat, {
      foreignKey: "mentee_id",
    });
    Mentee.hasMany(models.MenteeCefrMilestone, {
      foreignKey: "mentee_id",
    });
  };

  return Mentee;
};
