module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    "Notification",
    {
      title: {
        type: DataTypes.STRING,
      },

      message: {
        type: DataTypes.TEXT,
      },

      type: {
        type: DataTypes.STRING,
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
