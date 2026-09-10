import api from "./api";

// Hierarchical Content Tree — linearized play stream + resume pointer.
// See backend/services/courseStreamService.js for the traversal rule.

export const getCourseStream = async (lessonId) => {
  const response = await api.get(`/lessons/${lessonId}/stream`);
  return response.data.stream;
};

export const getCourseTree = async (lessonId) => {
  const response = await api.get(`/lessons/${lessonId}/tree`);
  return response.data.tree;
};

export const getCourseProgress = async (lessonId) => {
  const response = await api.get(`/lessons/${lessonId}/progress`);
  return response.data;
};

// Resolved "Resume Practice" target — the first incomplete item in the
// play stream (see backend/services/courseStreamService.js
// getResumeItem). Distinct from getCourseProgress above, which only
// ever returns the raw last-touched pointer.
export const getCourseResume = async (lessonId) => {
  const response = await api.get(`/lessons/${lessonId}/resume`);
  return response.data;
};

// itemType: 'content' | 'assessment'
export const updateCourseProgress = async (lessonId, itemType, itemId) => {
  const response = await api.post(`/lessons/${lessonId}/progress`, {
    itemType,
    itemId,
  });
  return response.data;
};
