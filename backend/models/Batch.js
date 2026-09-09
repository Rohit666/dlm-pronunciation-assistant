module.exports = (sequelize, DataTypes) => {
  const Batch = sequelize.define(
    "Batch",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      batch_name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,
      },

      mentor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },

      // Batch-wide fallback used when a lesson has no passing_score of
      // its own. See services/progressionService.js for the resolution
      // order (lesson.passing_score ?? this ?? 70.00).
      default_passing_threshold: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 70.0,
      },
    },
    {
      tableName: "batches",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );
  Batch.associate = (models) => {
    Batch.belongsTo(models.User, {
      foreignKey: "mentor_id",
    });
    Batch.hasMany(models.Mentee, {
      foreignKey: "batch_id",
    });
  };
  return Batch;
};
