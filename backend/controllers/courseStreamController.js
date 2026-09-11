const { Mentee, MenteeCourseProgress } = require("../models");
const {
  getCoursePlayStream,
  locateInStream,
  getResumeItem,
} = require("../services/courseStreamService");
const progressionService = require("../services/progressionService");

async function resolveMentee(userId) {
  return Mentee.findOne({ where: { user_id: userId } });
}

// GET /api/lessons/:lessonId/stream — the flattened, order-true play
// sequence for this course. Read by the mentor Tree Explorer (position
// numbers) and the mentee unified player (Next/Previous, auto-advance).
exports.getStream = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const stream = await getCoursePlayStream(lessonId);
    if (!stream) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    res.json({ success: true, stream });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/lessons/:lessonId/progress — the calling mentee's resume
// pointer, already resolved against the current stream (so a deleted/
// moved item degrades gracefully to "no saved position" rather than a
// dangling reference).
exports.getProgress = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const mentee = await resolveMentee(req.user.id);
    if (!mentee) {
      return res.status(404).json({ success: false, message: "Mentee not found" });
    }

    const [stream, progress] = await Promise.all([
      getCoursePlayStream(lessonId),
      MenteeCourseProgress.findOne({
        where: { mentee_id: mentee.id, course_id: lessonId },
      }),
    ]);

    if (!stream) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (!progress) {
      return res.json({ success: true, progress: null, position: null });
    }

    const position = locateInStream(
      stream,
      progress.last_active_item_type,
      progress.last_active_item_id,
    );

    res.json({
      success: true,
      progress: {
        itemType: progress.last_active_item_type,
        itemId: progress.last_active_item_id,
      },
      // null when the saved item no longer exists in the stream (deleted
      // content/assessment) — caller falls back to "start from the top".
      position,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/lessons/:lessonId/resume — the resolved "Resume Practice"
// target: the FIRST incomplete item in the play stream (never the raw
// last_active_item pointer — see getResumeItem for why that was wrong).
exports.getResumeTarget = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const mentee = await resolveMentee(req.user.id);
    if (!mentee) {
      return res.status(404).json({ success: false, message: "Mentee not found" });
    }

    const resume = await getResumeItem(lessonId, mentee.id);
    if (!resume) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.json({
      success: true,
      status: resume.status,
      item: resume.item,
      is_finished: resume.is_finished,
      // The mentee's active CourseRun this resolution was scoped
      // against — see courseStreamService.getResumeItem.
      run_id: resume.run_id,
      // Present only for status === "completed".
      stats: resume.stats || null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/lessons/:lessonId/start-run — Course Run lifecycle. Called
// on "Practice Again" (LessonPracticePage.jsx), never on a plain first-
// time "Start Practice" (getOrCreateActiveRun already handles that case
// implicitly, the first time an attempt/submission is made). Explicitly
// closes any run this mentee left `in_progress` for this course as
// `abandoned` and opens a fresh one at step 0 — see
// progressionService.startNewRun for why this needs to be its own call
// rather than relying on getOrCreateActiveRun's find-or-create: a
// genuinely still-open run exists at this point (the button only reads
// "Practice Again" once the PRIOR run finished), and this is the
// explicit signal to stop treating it as active.
exports.startRun = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const mentee = await resolveMentee(req.user.id);
    if (!mentee) {
      return res.status(404).json({ success: false, message: "Mentee not found" });
    }

    const run = await progressionService.startNewRun(lessonId, mentee.id);

    res.status(201).json({
      success: true,
      run: {
        id: run.id,
        runNumber: run.run_number,
        status: run.status,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/lessons/:lessonId/progress — body: { itemType: 'content'|'assessment', itemId }
// Upserted every time a mentee opens or completes a stream item, so
// "Resume Practice" always reopens the exact spot they left off at.
exports.updateProgress = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { itemType, itemId } = req.body;

    if (!["content", "assessment"].includes(itemType) || !itemId) {
      return res.status(400).json({ success: false, message: "itemType and itemId are required" });
    }

    const mentee = await resolveMentee(req.user.id);
    if (!mentee) {
      return res.status(404).json({ success: false, message: "Mentee not found" });
    }

    const [progress] = await MenteeCourseProgress.findOrCreate({
      where: { mentee_id: mentee.id, course_id: lessonId },
      defaults: { last_active_item_type: itemType, last_active_item_id: itemId },
    });

    progress.last_active_item_type = itemType;
    progress.last_active_item_id = itemId;
    await progress.save();

    res.json({ success: true, progress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
