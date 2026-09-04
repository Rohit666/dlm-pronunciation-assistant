// Demo-only mock payloads for the mentor analytics dashboard's
// phoneme heatmap, student tiering, and attempt-trajectory metrics.
// See services/mentorInsightsService.js for the intended real shape.

// Class-wide phoneme struggle rates. `struggleRate` is the percentage
// of attempts in the cohort scoring below the 60% "Incorrect" band the
// SRS defines for phoneme color-coding (Green >=80, Amber 60-79, Red <60).
export const MOCK_PHONEME_HEATMAP = [
  { symbol: "θ", struggleRate: 64, strugglingStudents: 14, totalStudents: 22 },
  { symbol: "r", struggleRate: 58, strugglingStudents: 12, totalStudents: 22 },
  { symbol: "v", struggleRate: 41, strugglingStudents: 9, totalStudents: 22 },
  { symbol: "l", struggleRate: 27, strugglingStudents: 6, totalStudents: 22 },
  { symbol: "w", struggleRate: 33, strugglingStudents: 7, totalStudents: 22 },
  { symbol: "ʃ", struggleRate: 18, strugglingStudents: 4, totalStudents: 22 },
  { symbol: "ð", struggleRate: 49, strugglingStudents: 11, totalStudents: 22 },
  { symbol: "z", struggleRate: 14, strugglingStudents: 3, totalStudents: 22 },
];

// Per-student rollup. `avgScore` drives the tier bucket (see
// utils/studentTiering.js): >=80 Strong, 60-79 Moderate, <60 Needs Attention.
export const MOCK_STUDENT_PERFORMANCE = [
  { id: 1, name: "Ananya Rao", email: "ananya@example.com", avgScore: 91, attempts: 34 },
  { id: 2, name: "Kabir Shah", email: "kabir@example.com", avgScore: 84, attempts: 28 },
  { id: 3, name: "Meera Nair", email: "meera@example.com", avgScore: 88, attempts: 41 },
  { id: 4, name: "Rohan Gupta", email: "rohan@example.com", avgScore: 73, attempts: 19 },
  { id: 5, name: "Sanya Iyer", email: "sanya@example.com", avgScore: 67, attempts: 22 },
  { id: 6, name: "Vikram Das", email: "vikram@example.com", avgScore: 71, attempts: 15 },
  { id: 7, name: "Priya Menon", email: "priya@example.com", avgScore: 62, attempts: 12 },
  { id: 8, name: "Arjun Verma", email: "arjun@example.com", avgScore: 48, attempts: 9 },
  { id: 9, name: "Divya Kapoor", email: "divya@example.com", avgScore: 55, attempts: 14 },
  { id: 10, name: "Ishaan Joshi", email: "ishaan@example.com", avgScore: 39, attempts: 7 },
];

// Average retries needed per lesson to cross the 80% mastery threshold
// (SRS 4.5 "Attempt-to-Mastery Delta"), aggregated per lesson.
export const MOCK_ATTEMPT_TRAJECTORY_METRICS = [
  { lessonId: 101, title: "Th Sounds: Thin vs Then", avgAttemptsToMastery: 5.2, studentsAtMastery: 12, studentsInProgress: 10 },
  { lessonId: 102, title: "Rolling Into R", avgAttemptsToMastery: 6.8, studentsAtMastery: 8, studentsInProgress: 14 },
  { lessonId: 103, title: "V and W: The Lip Test", avgAttemptsToMastery: 4.1, studentsAtMastery: 16, studentsInProgress: 6 },
  { lessonId: 105, title: "L vs R: The Confusable Pair", avgAttemptsToMastery: 7.4, studentsAtMastery: 6, studentsInProgress: 16 },
  { lessonId: 107, title: "Sh Sounds in Fast Speech", avgAttemptsToMastery: 3.3, studentsAtMastery: 18, studentsInProgress: 4 },
];
