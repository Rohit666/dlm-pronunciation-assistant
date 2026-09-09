const { Lesson, Topic, LessonSentence, LessonExercise } = require("../models");

// ---------------------------------------------------------------------
// Linearized Course Play Stream.
//
// The content tree (topics, arbitrary depth, holding contents and
// assessments — see the hierarchical-content-tree migration) still has
// to play back as ONE continuous sequence for a mentee: Next/Previous,
// auto-advance, and resume all operate on this flattened list, never on
// the tree directly.
//
// Traversal rule (depth-first, pre-order), applied at the course root
// and at every topic node: that node's own contents first (sentence_order
// ascending), then its own assessments (order_index ascending), then
// each child topic in order_index order, recursed the same way. This is
// a deliberate, documented ordering choice — the tree itself doesn't
// carry a single shared ordering between "contents" and "assessments" at
// the same node, so content-before-assessment-before-children is the
// convention every caller (stream, resume, mentor tree explorer) agrees
// on.
//
// Output shape (exactly the spec'd contract):
//   [{ item_type: 'content'|'assessment', id, topic_id, topic_path }]
// ---------------------------------------------------------------------

async function getCoursePlayStream(courseId) {
  const [lesson, topics, contents, assessments] = await Promise.all([
    Lesson.findByPk(courseId),
    Topic.findAll({ where: { course_id: courseId }, order: [["order_index", "ASC"]] }),
    LessonSentence.findAll({ where: { lesson_id: courseId }, order: [["sentence_order", "ASC"]] }),
    LessonExercise.findAll({ where: { lesson_id: courseId }, order: [["order_index", "ASC"]] }),
  ]);

  if (!lesson) return null;

  const topicsById = new Map(topics.map((topic) => [topic.id, topic]));
  const childrenByParent = new Map();
  for (const topic of topics) {
    const key = topic.parent_id === null ? "root" : topic.parent_id;
    if (!childrenByParent.has(key)) childrenByParent.set(key, []);
    childrenByParent.get(key).push(topic);
  }
  for (const list of childrenByParent.values()) {
    list.sort((a, b) => a.order_index - b.order_index);
  }

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

  function topicPath(topicId) {
    const segments = [];
    let current = topicId === null ? null : topicsById.get(topicId);
    while (current) {
      segments.unshift(current.title);
      current = current.parent_id === null ? null : topicsById.get(current.parent_id);
    }
    return segments.join(" > ");
  }

  const stream = [];

  function visitNode(topicId) {
    const path = topicPath(topicId);
    const key = topicId === null ? "root" : topicId;

    for (const content of contentsByTopic.get(key) || []) {
      stream.push({
        item_type: "content",
        id: content.id,
        topic_id: topicId,
        topic_path: path,
      });
    }
    for (const assessment of assessmentsByTopic.get(key) || []) {
      stream.push({
        item_type: "assessment",
        id: assessment.id,
        topic_id: topicId,
        topic_path: path,
      });
    }
    for (const child of childrenByParent.get(key) || []) {
      visitNode(child.id);
    }
  }

  visitNode(null);

  return stream;
}

// Locates one stream entry's position and its immediate neighbors — the
// primitive every Next/Previous/auto-advance control is built from.
function locateInStream(stream, itemType, itemId) {
  const index = stream.findIndex(
    (entry) => entry.item_type === itemType && String(entry.id) === String(itemId),
  );
  if (index === -1) return null;

  return {
    index,
    current: stream[index],
    previous: index > 0 ? stream[index - 1] : null,
    next: index < stream.length - 1 ? stream[index + 1] : null,
  };
}

module.exports = { getCoursePlayStream, locateInStream };
