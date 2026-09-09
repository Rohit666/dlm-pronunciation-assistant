module.exports = (sequelize, DataTypes) => {
  const StudentProgression = sequelize.define(
    "StudentProgression",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      mentee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "mentees",
          key: "id",
        },
      },

      // Which milestone track this row tracks. A mentee has at most one
      // row per framework — see the unique index on
      // (mentee_id, framework) in the migration.
      framework: {
        type: DataTypes.ENUM("cefr", "nep_stage"),
        allowNull: false,
      },

      // 1-indexed position within `framework`'s track. 0 = not yet
      // started (no lesson on this track has been passed).
      current_level_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      // Denormalized label (e.g. "B1" or "L3_MIDDLE") matching
      // current_level_order, kept alongside the order so callers don't
      // need the constants map just to display it.
      current_level_code: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
    },
    {
      tableName: "student_progressions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  StudentProgression.associate = (models) => {
    StudentProgression.belongsTo(models.Mentee, {
      foreignKey: "mentee_id",
    });
  };

  return StudentProgression;
};
