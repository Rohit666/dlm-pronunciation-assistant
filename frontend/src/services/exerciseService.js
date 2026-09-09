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
