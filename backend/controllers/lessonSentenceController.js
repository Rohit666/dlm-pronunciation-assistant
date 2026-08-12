const { LessonSentence } = require("../models");

exports.getLessonSentences = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const sentences = await LessonSentence.findAll({
      where: {
        lesson_id: lessonId,
      },

      order: [["sentence_order", "ASC"]],
    });

    res.json({
      success: true,
      sentences,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.createSentence = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const { sentence_order, sentence_text } = req.body;

    const sentence = await LessonSentence.create({
      lesson_id: lessonId,

      sentence_order,

      sentence_text,

      audio_path: req.files?.sentence_audio?.[0]?.path || null,

      image_path: req.files?.sentence_image?.[0]?.path || null,

      video_path: req.files?.sentence_video?.[0]?.path || null,
    });

    res.status(201).json({
      success: true,

      message: "Sentence created successfully",

      sentence,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.deleteSentence = async (req, res) => {
  try {
    const { id } = req.params;

    const sentence = await LessonSentence.findByPk(id);

    if (!sentence) {
      return res.status(404).json({
        success: false,
        message: "Sentence not found",
      });
    }

    await sentence.destroy();

    res.json({
      success: true,

      message: "Sentence deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.updateSentence = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      sentence_text,
      sentence_order,
      remove_image,
      remove_audio,
      remove_video,
    } = req.body;

    const sentence = await LessonSentence.findByPk(id);

    if (!sentence) {
      return res.status(404).json({
        success: false,
        message: "Sentence not found",
      });
    }

    let audio_path = sentence.audio_path;

    let image_path = sentence.image_path;

    let video_path = sentence.video_path;
    if (remove_image === "true") {
      image_path = null;
    }

    if (remove_audio === "true") {
      audio_path = null;
    }

    if (remove_video === "true") {
      video_path = null;
    }
    if (req.files?.audio?.[0]) {
      audio_path = req.files.audio[0].path;
    }

    if (req.files?.image?.[0]) {
      image_path = req.files.image[0].path;
    }

    if (req.files?.video?.[0]) {
      video_path = req.files.video[0].path;
    }

    await sentence.update({
      sentence_text,
      sentence_order,
      audio_path,
      image_path,
      video_path,
    });

    res.json({
      success: true,
      message: "Sentence updated successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.reorderSentences = async (req, res) => {
  try {
    const { sentences } = req.body;

    for (const sentence of sentences) {
      await LessonSentence.update(
        {
          sentence_order: sentence.sentence_order,
        },
        {
          where: {
            id: sentence.id,
          },
        },
      );
    }

    res.json({
      success: true,
      message: "Sentence order updated successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
