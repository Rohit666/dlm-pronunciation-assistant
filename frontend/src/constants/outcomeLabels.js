import { LESSON_OUTCOMES } from "./lessonOutcomes";

const OUTCOME_LABELS = LESSON_OUTCOMES.reduce((acc, item) => {
  acc[item.value] = item.label;

  return acc;
}, {});

export default OUTCOME_LABELS;
