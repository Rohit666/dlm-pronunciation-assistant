// Milestone frameworks a lesson's progression track can belong to.
// CEFR (A1-C2) is foreign-language specific; NEP_STAGE gives Indian
// languages (Kannada, Hindi, Marathi, ...) their own NEP 2020-aligned
// tier system. Order within each array IS the level_order (1-indexed) —
// index 0 is level_order 1, etc.
const PROGRESSION_FRAMEWORKS = {
  CEFR: "cefr",
  NEP_STAGE: "nep_stage",
};

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const NEP_STAGE_LEVELS = [
  "L1_FOUNDATIONAL",
  "L2_PREPARATORY",
  "L3_MIDDLE",
  "L4_SECONDARY",
  "L5_PROFICIENT",
];

const FRAMEWORK_LEVELS = {
  [PROGRESSION_FRAMEWORKS.CEFR]: CEFR_LEVELS,
  [PROGRESSION_FRAMEWORKS.NEP_STAGE]: NEP_STAGE_LEVELS,
};

// Last-resort fallback when neither the lesson nor its batch configures
// a passing score. Mentors can override at either level; this is not a
// hardcoded gate, only the resolution chain's floor.
const DEFAULT_PASSING_THRESHOLD = 70.0;

module.exports = {
  PROGRESSION_FRAMEWORKS,
  CEFR_LEVELS,
  NEP_STAGE_LEVELS,
  FRAMEWORK_LEVELS,
  DEFAULT_PASSING_THRESHOLD,
};
