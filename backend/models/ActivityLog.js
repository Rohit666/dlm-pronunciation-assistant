module.exports = (sequelize, DataTypes) => {
  const ActivityLog = sequelize.define(
    "ActivityLog",
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },

      // DB column is varchar(100) NOT NULL, was unbounded/nullable STRING before.
      action: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,
      },

      // DB column is varchar(100), was unbounded STRING before.
      entity_type: {
        type: DataTypes.STRING(100),
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
