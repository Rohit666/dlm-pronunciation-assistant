module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    "Notification",
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },

      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      message: {
        type: DataTypes.TEXT,
      },

      // DB column is varchar(100), was unbounded STRING before.
      type: {
        type: DataTypes.STRING(100),
      },

      reference_id: {
        type: DataTypes.INTEGER,
      },

      is_read: {
        type: DataTypes.BOOLEAN,

        defaultValue: false,
      },
    },
    {
      tableName: "notifications",
      timestamps: false,
      createdAt: "created_at",
      updatedAt: false,
    },
  );
  Notification.associate = (models) => {
    Notification.belongsTo(models.User, {
      foreignKey: "user_id",
    });
  };
  return Notification;
};
