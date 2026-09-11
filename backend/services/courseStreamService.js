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
const { parseJsonField } = require("../utils/jsonHelper");
const { round2 } = require("../utils/numberUtils");
const progressionService = require("./progressionService");
const activityRegistry = require("./activityRegistry");

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
        // Activity Provider Registry — single source of truth for how
        // to route to a step, so a new activity type (toefl_ibt, ...)
        // only needs its own registry entry, never a frontend switch
        // statement update. See activityRegistry.content.getRoute for
        // why this is the lesson overview, not a per-sentence link.
        route: activityRegistry.content.getRoute(content, courseId),
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
        route: activityRegistry.assessment.getRoute(assessment, courseId),
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

// Run-scoped completion stats for a fully-completed run — same
// "pooled mean of accepted-sentence accuracy + each exercise's best
// percentage" judgment call as before, now scoped to THIS run's
// attempts only rather than all-time history, since stats describe
// "how did this pass go", not "how has this mentee ever done".
async function computeRunStats(stream, menteeId, activeRun) {
  const contentIds = stream.filter((entry) => entry.item_type === "content").map((entry) => entry.id);
  const assessmentIds = stream.filter((entry) => entry.item_type === "assessment").map((entry) => entry.id);

  const [acceptedAssessments, exerciseAttempts] = await Promise.all([
    contentIds.length
      ? Assessment.findAll({
          where: { is_accepted: true },
          include: [
            {
              model: PracticeSession,
              required: true,
              where: { mentee_id: menteeId, lesson_sentence_id: contentIds },
              include: [{ model: PracticeAttempt, required: true, where: { course_run_id: activeRun.id } }],
            },
          ],
        })
      : [],
    assessmentIds.length
      ? ExerciseAttempt.findAll({
          where: { mentee_id: menteeId, exercise_id: assessmentIds, course_run_id: activeRun.id },
        })
      : [],
  ]);

  const completedContentIds = new Set(
    acceptedAssessments.map((assessment) => assessment.PracticeSession.lesson_sentence_id),
  );

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
    totalContents: contentIds.length,
    completedContents: completedContentIds.size,
    totalAssessments: assessmentIds.length,
    assessmentsTaken: bestPercentageByExercise.size,
    overallAverageScore,
  };
}

// ---------------------------------------------------------------------
// Resume resolution — Course Run lifecycle.
//
// Superseded design note: earlier deliveries special-cased an active
// `practice_attempts` row (status='in_progress') as authoritative over
// a stream-based completion scan, because that scan read
// `assessments.is_accepted`/`exercise_attempts` with NO notion of "this
// pass through the course" — a mentee's PRIOR pass's accepted sentences
// and exercise submissions counted toward completion forever, so a
// fresh "Practice Again" attempt got misread as already-done work. That
// special case is gone: every completion check below is scoped to the
// mentee's ACTIVE `CourseRun` via `activityRegistry`, so the walk itself
// now naturally lands on the first sentence/exercise not yet done THIS
// run — no separate short-circuit needed to get the same answer.
//
// getOrCreateActiveRun (progressionService) finds the mentee's
// `in_progress` CourseRun for this course, or mints one — this is the
// container every `isCompleted` check below is scoped against.
// Completion criteria live in activityRegistry, keyed by item_type, so
// a future activity type only needs its own registry entry, never a
// change here.
//
// Returns null for a missing/empty course. Otherwise one of:
//   { status: 'incomplete', item, is_finished: false, run_id }   — first incomplete stream entry, this run
//   { status: 'completed', item, is_finished: true, run_id, stats } — every
//     step done THIS run. item is the first stream entry (a "Review
//     Course" landing point — there's no single natural "next" item
//     once nothing is left).
// ---------------------------------------------------------------------
async function getResumeItem(courseId, menteeId) {
  const stream = await getCoursePlayStream(courseId);
  if (!stream || !stream.length) return null;

  const activeRun = await progressionService.getOrCreateActiveRun(courseId, menteeId);
  if (activeRun.total_steps !== stream.length) {
    await activeRun.update({ total_steps: stream.length });
  }

  for (const step of stream) {
    const provider = activityRegistry[step.item_type];
    const done = provider ? await provider.isCompleted(step, menteeId, activeRun) : false;
    if (!done) {
      if (activeRun.current_step_index !== step.step_index) {
        await activeRun.update({ current_step_index: step.step_index });
      }
      return { status: "incomplete", item: step, is_finished: false, run_id: activeRun.id };
    }
  }

  // Every step complete, this run.
  if (activeRun.status !== "completed") {
    await activeRun.update({
      status: "completed",
      completed_at: new Date(),
      current_step_index: stream.length,
    });
  }

  const stats = await computeRunStats(stream, menteeId, activeRun);

  return {
    status: "completed",
    item: stream[0],
    is_finished: true,
    run_id: activeRun.id,
    stats,
  };
}

module.exports = { getCoursePlayStream, locateInStream, getResumeItem };
