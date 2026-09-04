module.exports = (sequelize, DataTypes) => {
  const LessonSentence = sequelize.define(
    "LessonSentence",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      lesson_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "lessons",
          key: "id",
        },
      },

      sentence_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      sentence_text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      audio_path: {
        type: DataTypes.STRING(255),
      },

      image_path: {
        type: DataTypes.STRING(255),
      },

      video_path: {
        type: DataTypes.STRING(255),
      },
    },
    {
      tableName: "lesson_sentences",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );
  LessonSentence.associate = (models) => {
    LessonSentence.belongsTo(models.Lesson, {
      foreignKey: "lesson_id",
    });
    LessonSentence.hasMany(models.PracticeSession, {
      foreignKey: "lesson_sentence_id",
    });
  };
  return LessonSentence;
};
