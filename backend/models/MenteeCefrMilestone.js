module.exports = (sequelize, DataTypes) => {
  const MenteeCefrMilestone = sequelize.define(
    "MenteeCefrMilestone",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      mentee_id: { type: DataTypes.INTEGER, allowNull: false },
      cefr_level: { type: DataTypes.STRING(10), allowNull: false },
      accuracy_at_completion: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
      achieved_at: { type: DataTypes.DATE, allowNull: false },
    },
    {
      tableName: "mentee_cefr_milestones",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  MenteeCefrMilestone.associate = (models) => {
    MenteeCefrMilestone.belongsTo(models.Mentee, {
      foreignKey: "mentee_id",
    });
  };

  return MenteeCefrMilestone;
};
