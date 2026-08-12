import api from "./api";
export const getPracticeAttempt = async (attemptId) => {
  const response = await api.get(`/practice-attempts/${attemptId}`);
  return response.data;
};
export const startPracticeAttempt = async (lessonId) => {
  const response = await api.post("/practice-attempts/start", {
    lesson_id: lessonId,
  });
  return response.data;
};
export const updatePracticeProgress = async (
  attemptId,
  currentSentenceOrder,
) => {
  const response = await api.put(`/practice-attempts/${attemptId}/progress`, {
    currentSentenceOrder,
  });
  return response.data;
};
export const completePracticeAttempt = async (attemptId) => {
  const response = await api.post(`/practice-attempts/${attemptId}/complete`);
  return response.data;
};
export const getActiveAttempt = async (lessonId) => {
  const response = await api.get(
    `/practice-attempts/lesson/${lessonId}/active`,
  );
  return response.data;
};
