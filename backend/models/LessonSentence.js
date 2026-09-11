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

      // Modular block hierarchy (main_text / sub_text + attachments).
      // See utils/sentenceBlocks.js (backend) for shape validation and
      // frontend/src/utils/sentenceBlocks.js for the mirrored client
      // shape. Legacy sentence_text/audio_path/image_path/video_path
      // above are kept in sync with the main_text block by
      // lessonSentenceController so old readers (practiceController
      // .compare uses sentence_text as the AI reference text) keep
      // working.
      content_blocks: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      // Hierarchical Content Tree — NULL means this content sits at the
      // course root; non-null places it inside that topic/sub-topic.
      topic_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
    LessonSentence.belongsTo(models.Topic, {
      foreignKey: "topic_id",
    });
    LessonSentence.hasMany(models.PracticeSession, {
      foreignKey: "lesson_sentence_id",
    });
  };
  return LessonSentence;
};
