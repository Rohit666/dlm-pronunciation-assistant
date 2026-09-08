module.exports = (sequelize, DataTypes) => {
  const StudentPhonemeStat = sequelize.define(
    "StudentPhonemeStat",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      mentee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // IPA symbol, e.g. "θ", "r", "l".
      phoneme: {
        type: DataTypes.STRING(16),
        allowNull: false,
      },

      total_attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      weak_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      last_seen_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "student_phoneme_stats",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  StudentPhonemeStat.associate = (models) => {
    StudentPhonemeStat.belongsTo(models.Mentee, {
      foreignKey: "mentee_id",
    });
  };

  return StudentPhonemeStat;
};
