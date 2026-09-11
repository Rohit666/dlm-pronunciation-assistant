const { Lesson, Topic, LessonSentence, LessonExercise } = require("../models");

// GET /api/lessons/:lessonId/tree — mentor Tree Explorer + mentee stream
// builder both read this. Returns the full recursive tree: every Topic
// under the course, each carrying its own `children` (sub-topics),
// `contents` (lesson_sentences at that node) and `assessments`
// (lesson_exercises at that node), plus the course-root-level contents/
// assessments (topic_id IS NULL) under `root`.
exports.getCourseTree = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const [topics, contents, assessments] = await Promise.all([
      Topic.findAll({ where: { course_id: lessonId }, order: [["order_index", "ASC"]] }),
      LessonSentence.findAll({ where: { lesson_id: lessonId }, order: [["sentence_order", "ASC"]] }),
      LessonExercise.findAll({ where: { lesson_id: lessonId }, order: [["order_index", "ASC"]] }),
    ]);

    const contentsByTopic = new Map();
    for (const content of contents) {
      const key = content.topic_id === null ? "root" : content.topic_id;
      if (!contentsByTopic.has(key)) contentsByTopic.set(key, []);
      contentsByTopic.get(key).push(content);
    }

    const assessmentsByTopic = new Map();
    for (const assessment of assessments) {
      const key = assessment.topic_id === null ? "root" : assessment.topic_id;
      if (!assessmentsByTopic.has(key)) assessmentsByTopic.set(key, []);
      assessmentsByTopic.get(key).push(assessment);
    }

    function buildNode(topic) {
      return {
        id: topic.id,
        title: topic.title,
        order_index: topic.order_index,
        parent_id: topic.parent_id,
        contents: contentsByTopic.get(topic.id) || [],
        assessments: assessmentsByTopic.get(topic.id) || [],
        children: topics
          .filter((t) => t.parent_id === topic.id)
          .map(buildNode),
      };
    }

    const rootTopics = topics.filter((t) => t.parent_id === null).map(buildNode);

    res.json({
      success: true,
      tree: {
        course: { id: lesson.id, title: lesson.title },
        root: {
          contents: contentsByTopic.get("root") || [],
          assessments: assessmentsByTopic.get("root") || [],
        },
        topics: rootTopics,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/mentor/courses/:lessonId/topics — mentor/admin. body: { title, parent_id?, order_index? }
exports.createTopic = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, parent_id, order_index } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "title is required" });
    }

    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (parent_id) {
      const parent = await Topic.findOne({ where: { id: parent_id, course_id: lessonId } });
      if (!parent) {
        return res.status(400).json({ success: false, message: "parent_id is not a topic on this course" });
      }
    }

    const topic = await Topic.create({
      course_id: lessonId,
      parent_id: parent_id || null,
      title: title.trim(),
      order_index: order_index ?? 1,
    });

    res.status(201).json({ success: true, message: "Topic created successfully", topic });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/mentor/topics/:topicId — rename / reorder / move to a new parent.
exports.updateTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { title, order_index, parent_id } = req.body;

    const topic = await Topic.findByPk(topicId);
    if (!topic) {
      return res.status(404).json({ success: false, message: "Topic not found" });
    }

    if (parent_id !== undefined && Number(parent_id) === Number(topicId)) {
      return res.status(400).json({ success: false, message: "A topic cannot be its own parent" });
    }

    if (title !== undefined) topic.title = title.trim();
    if (order_index !== undefined) topic.order_index = order_index;
    if (parent_id !== undefined) topic.parent_id = parent_id || null;

    await topic.save();

    res.json({ success: true, message: "Topic updated successfully", topic });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/mentor/topics/:topicId — CASCADEs to sub-topics (self-FK);
// contents/assessments inside SET NULL back to the course root rather
// than being deleted (see the tree migration).
exports.deleteTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    const topic = await Topic.findByPk(topicId);
    if (!topic) {
      return res.status(404).json({ success: false, message: "Topic not found" });
    }

    await topic.destroy();

    res.json({ success: true, message: "Topic deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
