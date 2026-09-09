export const ROUTES = {
  LOGIN: "/login",

  ADMIN_DASHBOARD: "/admin",
  ADMIN_MENTORS: "/admin/mentors",
  ADMIN_MENTEES: "/admin/mentees",
  ADMIN_BATCHES: "/admin/batches",

  MENTOR_DASHBOARD: "/mentor",
  MENTOR_LESSONS: "/mentor/lessons",
  mentorLessonDetail: (lessonId) => `/mentor/lessons/${lessonId}`,
  MENTOR_REVIEWS: "/mentor/reviews",
  MENTOR_BATCHES: "/mentor/batches",
  MENTOR_MENTEES: "/mentor/mentees",
  MENTOR_ANALYTICS: "/mentor/analytics",

  MENTEE_DASHBOARD: "/mentee",
  MENTEE_LESSONS: "/mentee/lessons",
  MENTEE_HISTORY: "/mentee/practice-history",
  MENTEE_PRACTICE: "/mentee/practice",
  practicePlayer: (lessonId, attemptId) =>
    `/mentee/practice/${lessonId}/player/${attemptId}`,

  practiceLoading: (lessonId, attemptId) =>
    `/mentee/practice/${lessonId}/player/${attemptId}/loading`,
  pronunciationAssessment: (lessonId, attemptId) =>
    `/mentee/practice/${lessonId}/player/${attemptId}/pronunciation-assessment`,

  // Hierarchical Content Tree — full-width assessment player (replaces
  // the old modal popup, ExercisePlayerModal.jsx, now deprecated).
  assessmentPlayer: (lessonId, exerciseId) =>
    `/mentee/practice/${lessonId}/assessment/${exerciseId}`,
};
