const {
  Lesson,
  Topic,
  LessonSentence,
  LessonExercise,
  PracticeSession,
  Assessment,
  ExerciseAttempt,
} = require("../models");

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

// ---------------------------------------------------------------------
// Resume resolution.
//
// Bug fix: "Resume Practice" must land on the FIRST incomplete stream
// item, not whatever the mentee happened to touch most recently.
// mentee_course_progress.last_active_item only ever records "last
// opened" — it was being read directly as the resume target, so opening
// the Assessment (even without finishing it) overwrote the pointer and
// Resume Practice kept sending the mentee back to it, skipping a still-
// incomplete earlier sentence entirely.
//
// Completion rules:
//   content (sentence)    -> mentee has an accepted assessment
//                            (assessments.is_accepted = TRUE, joined
//                            through its practice_session) for that
//                            lesson_sentence
//   assessment (exercise) -> mentee has at least one exercise_attempts
//                            row with passed = TRUE for that exercise
//
// Returns null for a missing/empty course. Otherwise
// { status: 'incomplete', item } for the first incomplete stream entry,
// or { status: 'complete', item } once every item is done — item is
// then the LAST assessment in the stream (its result screen) when the
// course has one, else the first stream item (nothing left to resume
// into but the start, for review).
// ---------------------------------------------------------------------
async function getResumeItem(courseId, menteeId) {
  const stream = await getCoursePlayStream(courseId);
  if (!stream || !stream.length) return null;

  const contentIds = stream.filter((entry) => entry.item_type === "content").map((entry) => entry.id);
  const assessmentIds = stream
    .filter((entry) => entry.item_type === "assessment")
    .map((entry) => entry.id);

  const [acceptedAssessments, passedAttempts] = await Promise.all([
    contentIds.length
      ? Assessment.findAll({
          where: { is_accepted: true },
          include: [
            {
              model: PracticeSession,
              required: true,
              where: { mentee_id: menteeId, lesson_sentence_id: contentIds },
            },
          ],
        })
      : [],
    assessmentIds.length
      ? ExerciseAttempt.findAll({
          where: { mentee_id: menteeId, exercise_id: assessmentIds, passed: true },
        })
      : [],
  ]);

  const completedContentIds = new Set(
    acceptedAssessments.map((assessment) => assessment.PracticeSession.lesson_sentence_id),
  );
  const completedAssessmentIds = new Set(passedAttempts.map((attempt) => attempt.exercise_id));

  const isComplete = (entry) =>
    entry.item_type === "content"
      ? completedContentIds.has(entry.id)
      : completedAssessmentIds.has(entry.id);

  const firstIncomplete = stream.find((entry) => !isComplete(entry));
  if (firstIncomplete) {
    return { status: "incomplete", item: firstIncomplete };
  }

  const lastAssessment = [...stream].reverse().find((entry) => entry.item_type === "assessment");
  return { status: "complete", item: lastAssessment || stream[0] };
}

module.exports = { getCoursePlayStream, locateInStream, getResumeItem };
