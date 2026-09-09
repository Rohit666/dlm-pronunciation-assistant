import api from "./api";

// Mentor authority to shape a course's topic tree. Reading the tree
// itself lives in courseStreamService.getCourseTree (mentees read it
// too, via lessonRoutes.js — not mentor-gated).

export const createTopic = async (lessonId, payload) => {
  const response = await api.post(`/mentor/courses/${lessonId}/topics`, payload);
  return response.data;
};

export const updateTopic = async (topicId, payload) => {
  const response = await api.put(`/mentor/topics/${topicId}`, payload);
  return response.data;
};

export const deleteTopic = async (topicId) => {
  const response = await api.delete(`/mentor/topics/${topicId}`);
  return response.data;
};
