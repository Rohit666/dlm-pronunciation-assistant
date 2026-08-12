import api from "./api";

export const getWeakStudents = async () => {
  const response = await api.get("/analytics/weak-students");
  return response.data;
};
export const getInactiveStudents = async () => {
  const response = await api.get("/analytics/inactive-students");
  return response.data;
};
export const getLessonEffectiveness = async () => {
  const response = await api.get("/analytics/lesson-effectiveness");
  return response.data;
};
export const getWeakOutcomes = async () => {
  const response = await api.get("/analytics/weak-outcomes");
  return response.data;
};
export const getMostImprovedStudents = async () => {
  const response = await api.get("/analytics/most-improved-students");
  return response.data;
};
