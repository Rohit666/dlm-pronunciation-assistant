// Demo-only mock payloads for the mentee dashboard's discovery
// carousels, CEFR milestones, and score/trajectory widgets.
//
// Shaped to match what the real endpoints should eventually return
// (see services/menteeInsightsService.js) so swapping the mock calls
// for `api.get(...)` later is a one-line change per function, not a
// component rewrite.

// A student's current weak phonemes, as the ai-runtime pipeline would
// report them (see ai-runtime/app/engines/pronunciation) if per-attempt
// phoneme results were persisted. This is the input the client-side
// recommendation heuristic runs against.
export const MOCK_STUDENT_WEAK_PHONEMES = [
  { symbol: "θ", accuracy: 42 },
  { symbol: "r", accuracy: 55 },
  { symbol: "v", accuracy: 58 },
];

// Lesson catalog used by every carousel + the heuristic. `targetPhonemes`
// mirrors the SRS 4.1(b) "Target Phonemes Array" field lessons are
// meant to carry; the current `lessons` table doesn't have this column
// yet (see Gap Assessment), so it's mocked here per-lesson.
export const MOCK_LESSON_CATALOG = [
  {
    id: 101,
    title: "Th Sounds: Thin vs Then",
    description: "Distinguish voiceless and voiced 'th' in everyday words.",
    thumbnail: null,
    cefrLevel: "A2",
    targetPhonemes: ["θ", "ð"],
    status: "not_started",
    progress: 0,
    duration: 8,
  },
  {
    id: 102,
    title: "Rolling Into R",
    description: "Build the tongue placement for a clear English /r/.",
    thumbnail: null,
    cefrLevel: "A2",
    targetPhonemes: ["r"],
    status: "in_progress",
    progress: 40,
    duration: 10,
  },
  {
    id: 103,
    title: "V and W: The Lip Test",
    description: "Feel the difference between a lip-bite /v/ and a rounded /w/.",
    thumbnail: null,
    cefrLevel: "B1",
    targetPhonemes: ["v", "w"],
    status: "not_started",
    progress: 0,
    duration: 7,
  },
  {
    id: 104,
    title: "Everyday Greetings",
    description: "Practice natural rhythm in common conversational openers.",
    thumbnail: null,
    cefrLevel: "A1",
    targetPhonemes: [],
    status: "completed",
    progress: 100,
    duration: 6,
  },
  {
    id: 105,
    title: "L vs R: The Confusable Pair",
    description: "Side-by-side minimal pairs to separate /l/ and /r/.",
    thumbnail: null,
    cefrLevel: "B1",
    targetPhonemes: ["l", "r"],
    status: "not_started",
    progress: 0,
    duration: 9,
  },
  {
    id: 106,
    title: "Ordering at a Cafe",
    description: "A short conversational scenario at B1 level.",
    thumbnail: null,
    cefrLevel: "B1",
    targetPhonemes: [],
    status: "in_progress",
    progress: 65,
    duration: 12,
  },
  {
    id: 107,
    title: "Sh Sounds in Fast Speech",
    description: "Keep /ʃ/ crisp even at conversational pace.",
    thumbnail: null,
    cefrLevel: "B2",
    targetPhonemes: ["ʃ"],
    status: "not_started",
    progress: 0,
    duration: 8,
  },
  {
    id: 108,
    title: "Describing Your Weekend",
    description: "Fluency-focused free-response practice at B2 level.",
    thumbnail: null,
    cefrLevel: "B2",
    targetPhonemes: [],
    status: "not_started",
    progress: 0,
    duration: 15,
  },
  {
    id: 109,
    title: "Z Sounds: Buzzing Consonants",
    description: "Voiced /z/ drilled against its voiceless pair /s/.",
    thumbnail: null,
    cefrLevel: "A2",
    targetPhonemes: ["z"],
    status: "not_started",
    progress: 0,
    duration: 6,
  },
  {
    id: 110,
    title: "Job Interview Basics",
    description: "Formal register practice for a C1 speaking scenario.",
    thumbnail: null,
    cefrLevel: "C1",
    targetPhonemes: [],
    status: "not_started",
    progress: 0,
    duration: 14,
  },
];

// Ids the student has bookmarked. In production this belongs on the
// user profile (or a dedicated watchlist table); for the demo it's a
// flat id list checked against MOCK_LESSON_CATALOG.
export const MOCK_WATCHLIST_LESSON_IDS = [103, 107, 110];

export const MOCK_CEFR_MILESTONES = [
  { level: "A1", status: "achieved", accuracyAtCompletion: 91, dateAchieved: "2026-06-14" },
  { level: "A2", status: "achieved", accuracyAtCompletion: 86, dateAchieved: "2026-07-22" },
  { level: "B1", status: "current", accuracyAtCompletion: null, dateAchieved: null },
  { level: "B2", status: "locked", accuracyAtCompletion: null, dateAchieved: null },
  { level: "C1", status: "locked", accuracyAtCompletion: null, dateAchieved: null },
  { level: "C2", status: "locked", accuracyAtCompletion: null, dateAchieved: null },
];

export const MOCK_SCORE_OVERVIEW = {
  accuracy: 78,
  fluency: 64,
  completeness: 88,
};

// Score-per-attempt trajectory toward the 80% mastery threshold, for
// the lesson the student is actively working on (per SRS 4.5's
// "Attempt-to-Mastery Delta" metric, mirrored here at the student level).
export const MOCK_ATTEMPT_TRAJECTORY = {
  lessonTitle: "Rolling Into R",
  masteryThreshold: 80,
  attempts: [
    { attemptNumber: 1, score: 38 },
    { attemptNumber: 2, score: 47 },
    { attemptNumber: 3, score: 45 },
    { attemptNumber: 4, score: 58 },
    { attemptNumber: 5, score: 66 },
    { attemptNumber: 6, score: 71 },
    { attemptNumber: 7, score: 79 },
  ],
};
