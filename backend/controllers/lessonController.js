const { Lesson } = require("../models");
const { parseJsonField } = require("../utils/jsonHelper");
exports.getLessons = async (req, res) => {
  try {
    const { status } = req.query;

    const whereClause = {};

    if (status) {
      whereClause.lesson_status = status;
    }

    const rawLessons = await Lesson.findAll({
      where: whereClause,

      order: [["id", "DESC"]],
    });
    const lessons = rawLessons.map((lesson) => ({
      ...lesson.toJSON(),
      lesson_outcomes: parseJsonField(lesson.lesson_outcomes),
      target_skills: parseJsonField(lesson.target_skills),
    }));
    res.json({
      success: true,
      lessons,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }
    const lessonData = lesson.toJSON();
    lessonData.lesson_outcomes = parseJsonField(lesson.lesson_outcomes);
    lessonData.target_skills = parseJsonField(lesson.target_skills);
    res.json({
      success: true,
      lesson: lessonData,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.createLesson = async (req, res) => {
  try {
    const {
      title,
      cefr_level,
      description,
      lesson_type,
      difficulty_level,
      estimated_duration,
      lesson_outcomes,
      target_skills,
    } = req.body;

    const lesson = await Lesson.create({
      title,
      cefr_level,
      description,
      thumbnail: req.file ? req.file.path : null,
      created_by: req.user.id,
      lesson_status: "draft",
      lesson_type,
      difficulty_level,
      estimated_duration,
      lesson_outcomes: lesson_outcomes ? JSON.parse(lesson_outcomes) : [],
      target_skills: target_skills ? JSON.parse(target_skills) : [],
    });

    res.status(201).json({
      success: true,
      message: "Lesson created successfully",
      lesson,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.updateLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      cefr_level,
      lesson_type,
      difficulty_level,
      estimated_duration,
      lesson_outcomes,
      target_skills,
    } = req.body;

    const lesson = await Lesson.findByPk(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    let thumbnail = lesson.thumbnail;

    if (req.file) {
      thumbnail = req.file.path;
    }

    await lesson.update({
      title,
      description,
      cefr_level,
      thumbnail,
      lesson_type,
      difficulty_level,
      estimated_duration,
      lesson_outcomes: lesson_outcomes ? JSON.parse(lesson_outcomes) : [],
      target_skills: target_skills ? JSON.parse(target_skills) : [],
    });

    res.json({
      success: true,
      message: "Lesson updated successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.updateLessonStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { lesson_status } = req.body;

    const lesson = await Lesson.findByPk(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    await lesson.update({
      lesson_status,
    });

    res.json({
      success: true,
      message: "Lesson status updated successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findByPk(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    if (lesson.lesson_status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft lessons can be permanently deleted",
      });
    }

    await lesson.destroy();

    res.json({
      success: true,
      message: "Lesson deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
