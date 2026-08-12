import api from "./api";
export const getReviewAttempts = async () => {
  const response = await api.get("/mentor-reviews/attempts");
  return response.data;
};
export const getReviewAttemptDetails = async (attemptId) => {
  const response = await api.get(`/mentor-reviews/attempt/${attemptId}`);
  return response.data;
};
export const saveAttemptReview = async (attemptId, payload) => {
  const response = await api.put(
    `/mentor-reviews/attempt/${attemptId}`,
    payload,
  );
  return response.data;
};
export const getMyAttempts = async () => {
  const response = await api.get(`/practice-attempts/my-attempts`);
  return response.data;
};
export const getAttemptResult = async (attemptId) => {
  const response = await api.get(`/practice-attempts/result/${attemptId}`);
  return response.data;
};
