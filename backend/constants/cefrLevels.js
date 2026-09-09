// Canonical CEFR level order, shared by progressionService (advance /
// lock decisions) and any query that needs to compare two levels.
const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const indexOf = (level) => CEFR_LEVELS.indexOf(level);

// Next level after `level`, or null if already at the top (or `level`
// isn't a recognized CEFR level at all).
const nextLevel = (level) => {
  const index = indexOf(level);
  if (index === -1 || index === CEFR_LEVELS.length - 1) return null;
  return CEFR_LEVELS[index + 1];
};

// True if `lessonLevel` sits strictly after `currentLevel` in the CEFR
// order — i.e. the mentee hasn't unlocked it yet. A lesson with no CEFR
// level (or one outside the known list) is never locked — there's
// nothing to gate it against.
const isLevelLocked = (lessonLevel, currentLevel) => {
  if (!lessonLevel) return false;
  const lessonIndex = indexOf(lessonLevel);
  if (lessonIndex === -1) return false;
  const currentIndex = indexOf(currentLevel);
  if (currentIndex === -1) return false;
  return lessonIndex > currentIndex;
};

module.exports = { CEFR_LEVELS, nextLevel, isLevelLocked };
