import api from "./api";

export const getLessonExercises = async (lessonId) => {
  const response = await api.get(`/lessons/${lessonId}/exercises`);
  return response.data.exercises;
};

// Single-exercise fetch — the full-width AssessmentPlayerPage lands on
// a direct route (no lesson-scoped list available there).
export const getExercise = async (exerciseId) => {
  const response = await api.get(`/exercises/${exerciseId}`);
  return response.data.exercise;
};

export const submitExercise = async (exerciseId, answers) => {
  const response = await api.post(`/exercises/${exerciseId}/submit`, { answers });
  return response.data;
};

export const getExerciseAttempts = async (exerciseId) => {
  const response = await api.get(`/exercises/${exerciseId}/attempts`);
  return response.data.attempts;
};

// Mentor authoring — POST /api/mentor/lessons/:lessonId/exercises.
export const createLessonExercise = async (lessonId, payload) => {
  const response = await api.post(`/mentor/lessons/${lessonId}/exercises`, payload);
  return response.data;
};

export const deleteLessonExercise = async (exerciseId) => {
  const response = await api.delete(`/mentor/exercises/${exerciseId}`);
  return response.data;
};

// --- Comprehensive Assessment History Hubs -----------------------------

// Mentee: every assessment attempt across every lesson.
export const getMenteeAssessmentAttempts = async () => {
  const response = await api.get(`/mentee-dashboard/assessment-attempts`);
  return response.data.attempts;
};

// Mentee: full report card for one of the mentee's own past attempts.
export const getMenteeAttemptDetail = async (attemptId) => {
  const response = await api.get(`/exercises/attempts/${attemptId}`);
  return response.data;
};

// Mentor: every attempt on one exercise, scoped to the mentor's batches.
export const getExerciseAttemptsForMentor = async (exerciseId) => {
  const response = await api.get(`/mentor/exercises/${exerciseId}/attempts`);
  return response.data;
};

// Mentor: full report card for a specific mentee submission to audit.
export const getAttemptDetailForMentor = async (attemptId) => {
  const response = await api.get(`/mentor/assessment-attempts/${attemptId}`);
  return response.data;
};
