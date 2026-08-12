export const getScoreMeta = (score) => {
  if (score >= 90) {
    return {
      color: "#10b981",
      badge: "Excellent",
      message:
        "Great job! Your pronunciation is very close to the lesson model.",
    };
  }

  if (score >= 75) {
    return {
      color: "#4f46e5",
      badge: "Very Good",
      message:
        "Very good pronunciation. A little more practice will make it even better.",
    };
  }

  if (score >= 60) {
    return {
      color: "#f59e0b",
      badge: "Good Progress",
      message: "You're improving well. Keep practising to build consistency.",
    };
  }

  return {
    color: "#ef4444",
    badge: "Keep Practising",
    message:
      "Every practice helps. Try again and focus on the highlighted words.",
  };
};
