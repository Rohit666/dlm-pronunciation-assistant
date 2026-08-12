export const hasSeenJourneyCelebration = (userId) => {
  return localStorage.getItem(`journey-celebrated-${userId}`) === "true";
};

export const markJourneyCelebrationSeen = (userId) => {
  localStorage.setItem(`journey-celebrated-${userId}`, "true");
};
