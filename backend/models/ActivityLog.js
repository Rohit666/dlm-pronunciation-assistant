module.exports = (sequelize, DataTypes) => {
  const ActivityLog = sequelize.define(
    "ActivityLog",
    {
      action: {
        type: DataTypes.STRING,
      },

      description: {
        type: DataTypes.TEXT,
      },

      entity_type: {
        type: DataTypes.STRING,
      },

      entity_id: {
        type: DataTypes.INTEGER,
      },
    },
    {
      tableName: "activity_logs",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    },
  );

  ActivityLog.associate = (models) => {
    ActivityLog.belongsTo(models.User, {
      foreignKey: "user_id",
    });
  };

  return ActivityLog;
};
