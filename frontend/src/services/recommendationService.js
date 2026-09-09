import api from "./api";

// Requirement 3.2 — live GET /api/recommendations/mentee. Distinct from
// the existing outcome-based "/recommendations" call DashboardPage.jsx
// already makes for RecommendationSection/JourneyCard — this is the new
// multi-skill (pronunciation/vocabulary/grammar) adaptive engine.
export const getAdaptiveRecommendations = async () => {
  const response = await api.get("/recommendations/mentee");
  return response.data;
};
