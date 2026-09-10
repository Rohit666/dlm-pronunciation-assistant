const {
  Lesson,
  Topic,
  LessonSentence,
  LessonExercise,
  PracticeSession,
  Assessment,
  ExerciseAttempt,
  PracticeAttempt,
} = require("../models");
const PRACTICE_ATTEMPT_STATUSES = require("../constants/practiceAttemptStatuses");
const { parseJsonField } = require("../utils/jsonHelper");
const { round2 } = require("../utils/numberUtils");

const TITLE_MAX_LENGTH = 45;

function stripHtml(html) {
  return String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Server-side mirror of frontend/src/utils/sentenceBlocks.js's
// getContentPreviewLabel — same resolution order (main_text block ->
// legacy sentence_text -> "Content #N" fallback) and truncation, so a
// content step's title is consistent wherever it's shown (mentor tree,
// mentee stream). Kept local rather than shared cross-runtime since
// there's no existing JS module shared between backend and frontend in
// this repo.
function resolveContentTitle(content) {
  const contentBlocks = parseJsonField(content.content_blocks);
  const mainBlock =
    contentBlocks.find((block) => block.type === "main_text") || contentBlocks[0];
  const rawText = stripHtml(mainBlock?.text) || stripHtml(content.sentence_text);

  if (!rawText) {
    return `Content #${content.sentence_order}`;
  }

  return rawText.length > TITLE_MAX_LENGTH
    ? `${rawText.slice(0, TITLE_MAX_LENGTH).trim()}...`
    : rawText;
}

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
// Output shape:
//   [{ step_index, item_type: 'content'|'assessment', id, title, topic_id, topic_path }]
// step_index is this entry's position in the flattened array (0-based,
// strictly ascending, assigned in the same single pass that walks the
// tree — so sibling order via sentence_order/order_index is preserved
// exactly, and two back-to-back assessments still get their own
// individual, sequential step_index values, never sharing one). title
// is a human-readable label — resolveContentTitle for content, the
// LessonExercise's own `title` column for an assessment.
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
        step_index: stream.length,
        item_type: "content",
        id: content.id,
        title: resolveContentTitle(content),
        topic_id: topicId,
        topic_path: path,
      });
    }
    for (const assessment of assessmentsByTopic.get(key) || []) {
      stream.push({
        step_index: stream.length,
        item_type: "assessment",
        id: assessment.id,
        title: assessment.title,
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
// Bug fix #1: "Resume Practice" must land on the FIRST incomplete
// stream item, not whatever the mentee happened to touch most recently.
// mentee_course_progress.last_active_item only ever records "last
// opened" — it was being read directly as the resume target, so opening
// the Assessment (even without finishing it) overwrote the pointer and
// Resume Practice kept sending the mentee back to it, skipping a still-
// incomplete earlier sentence entirely.
//
// Bug fix #2, found via a real runtime state (practice_attempts row:
// status='in_progress', current_sentence_order=2, attempt_number=9):
// content-completion below is judged off assessments.is_accepted —
// each sentence's BEST-EVER accepted score, across every attempt past
// or present. That stays TRUE even while a later, still-open
// PracticeAttempt (a full lesson retry — see practiceAttemptService
// .getOrCreatePracticeAttempt, which starts a new attempt_number when
// the mentee re-enters a lesson with no attempt currently in_progress)
// is mid-way back through the same sentences again. So the stream-based
// read isn't wrong about history, it's answering the wrong question
// while a live attempt is open: a mentee sitting in_progress at
// sentence_order 2 of attempt #9 must not be routed to the Assessment
// just because attempt #8 already got sentence #2 accepted. An active
// PracticeAttempt (practice_attempts.status = 'in_progress') is
// therefore checked FIRST, authoritative over any historical
// acceptance record, and short-circuits straight to that attempt's
// current sentence — the stream-based first-incomplete-item scan below
// only runs once there is no such live attempt (mentee hasn't started,
// or a prior attempt fully wrapped with nothing left open).
//
// Completion rules (once no active attempt applies):
//   content (sentence)    -> mentee has an accepted assessment
//                            (assessments.is_accepted = TRUE, joined
//                            through its practice_session) for that
//                            lesson_sentence
//   assessment (exercise) -> mentee has AT LEAST ONE exercise_attempts
//                            row for that exercise (any outcome, not
//                            just passed). Requiring a PASS here would
//                            let a mentee who keeps failing get stuck
//                            re-taking the same exercise forever with no
//                            way to move the stream forward — one
//                            genuine attempt satisfies progression; a
//                            passing score is what retakes are for, not
//                            what unblocks the next step.
//
// Returns null for a missing/empty course. Otherwise one of:
//   { status: 'attempt_in_progress', item, activeAttempt: { id, attemptNumber, currentSentenceOrder }, is_finished: false }
//   { status: 'incomplete', item, is_finished: false }         — first incomplete stream entry
//   { status: 'completed', item, is_finished: true, stats }    — every
//     step done. item is the first stream entry (a "Review Course"
//     landing point — there's no single natural "next" item once
//     nothing is left); stats is getCourseCompletionStats' summary,
//     computed here without a second pass since the completion scan
//     already has everything it needs.
// ---------------------------------------------------------------------
async function getResumeItem(courseId, menteeId) {
  const stream = await getCoursePlayStream(courseId);
  if (!stream || !stream.length) return null;

  const activeAttempt = await PracticeAttempt.findOne({
    where: {
      mentee_id: menteeId,
      lesson_id: courseId,
      status: PRACTICE_ATTEMPT_STATUSES.IN_PROGRESS,
    },
    order: [["created_at", "DESC"]],
  });

  if (activeAttempt) {
    const currentSentence = await LessonSentence.findOne({
      where: { lesson_id: courseId, sentence_order: activeAttempt.current_sentence_order },
    });

    // Best-effort mapping onto the stream's { item_type, id } shape so
    // this response stays consistent with the other statuses below —
    // falls back to the first content entry when current_sentence_order
    // points past the end of the stream (e.g. the attempt is sitting on
    // the last sentence, awaiting its /complete call) or the sentence
    // was deleted since the attempt started.
    const item =
      (currentSentence && stream.find((entry) => entry.item_type === "content" && entry.id === currentSentence.id)) ||
      stream.find((entry) => entry.item_type === "content") ||
      stream[0];

    return {
      status: "attempt_in_progress",
      item,
      is_finished: false,
      activeAttempt: {
        id: activeAttempt.id,
        attemptNumber: activeAttempt.attempt_number,
        currentSentenceOrder: activeAttempt.current_sentence_order,
      },
    };
  }

  const contentIds = stream.filter((entry) => entry.item_type === "content").map((entry) => entry.id);
  const assessmentIds = stream
    .filter((entry) => entry.item_type === "assessment")
    .map((entry) => entry.id);

  const [acceptedAssessments, exerciseAttempts] = await Promise.all([
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
          where: { mentee_id: menteeId, exercise_id: assessmentIds },
        })
      : [],
  ]);

  const completedContentIds = new Set(
    acceptedAssessments.map((assessment) => assessment.PracticeSession.lesson_sentence_id),
  );
  const completedAssessmentIds = new Set(exerciseAttempts.map((attempt) => attempt.exercise_id));

  const isComplete = (entry) =>
    entry.item_type === "content"
      ? completedContentIds.has(entry.id)
      : completedAssessmentIds.has(entry.id);

  const firstIncomplete = stream.find((entry) => !isComplete(entry));
  if (firstIncomplete) {
    return { status: "incomplete", item: firstIncomplete, is_finished: false };
  }

  // Every step complete. Judgment call, disclosed: "overall average
  // score" isn't defined precisely in the spec, so it's the mean of two
  // 0-100 quantities pooled together — each accepted sentence's
  // overall_accuracy, and each attempted exercise's BEST percentage
  // across its attempts (so a passed retake counts at its improved
  // score, not its first failing one). null, not 0, when there's
  // nothing to average (a course with steps but no scorable outcome
  // yet, which shouldn't happen once every step is complete, but stays
  // honest rather than reporting a fake 0 if it ever does).
  const bestPercentageByExercise = new Map();
  for (const attempt of exerciseAttempts) {
    const current = bestPercentageByExercise.get(attempt.exercise_id);
    const percentage = Number(attempt.percentage);
    if (current === undefined || percentage > current) {
      bestPercentageByExercise.set(attempt.exercise_id, percentage);
    }
  }
  const scores = [
    ...acceptedAssessments.map((assessment) => Number(assessment.overall_accuracy)),
    ...bestPercentageByExercise.values(),
  ];
  const overallAverageScore = scores.length
    ? round2(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : null;

  return {
    status: "completed",
    item: stream[0],
    is_finished: true,
    stats: {
      totalContents: contentIds.length,
      completedContents: completedContentIds.size,
      totalAssessments: assessmentIds.length,
      assessmentsTaken: bestPercentageByExercise.size,
      overallAverageScore,
    },
  };
}

module.exports = { getCoursePlayStream, locateInStream, getResumeItem };
