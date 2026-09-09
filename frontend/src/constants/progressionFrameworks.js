// Mirrors backend/constants/progressionFrameworks.js. Order within each
// array IS the level_order (1-indexed) the backend expects.
export const PROGRESSION_FRAMEWORKS = {
  CEFR: "cefr",
  NEP_STAGE: "nep_stage",
};

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const NEP_STAGE_LEVELS = [
  "L1_FOUNDATIONAL",
  "L2_PREPARATORY",
  "L3_MIDDLE",
  "L4_SECONDARY",
  "L5_PROFICIENT",
];

// Flattened into a single dependent-field-free select: each option
// value packs "<framework>:<level_order>" so LessonsPage doesn't need
// react-hook-form `watch` wiring just to swap a second dropdown's
// options when the framework changes.
export const PROGRESSION_LEVEL_OPTIONS = [
  ...CEFR_LEVELS.map((code, index) => ({
    value: `${PROGRESSION_FRAMEWORKS.CEFR}:${index + 1}`,
    label: `CEFR · ${code}`,
  })),
  ...NEP_STAGE_LEVELS.map((code, index) => ({
    value: `${PROGRESSION_FRAMEWORKS.NEP_STAGE}:${index + 1}`,
    label: `NEP Stage · ${code.replace(/_/g, " ")}`,
  })),
];

export function parseProgressionLevelOption(value) {
  if (!value) {
    return { framework: "", level_order: "" };
  }
  const [framework, levelOrder] = value.split(":");
  return { framework, level_order: levelOrder };
}

export function toProgressionLevelOption(framework, levelOrder) {
  if (!framework || !levelOrder) {
    return "";
  }
  return `${framework}:${levelOrder}`;
}
