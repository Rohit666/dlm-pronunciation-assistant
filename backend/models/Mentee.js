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
  };

  return Mentee;
};
