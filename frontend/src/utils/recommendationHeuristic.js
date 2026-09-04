// Client-side heuristic requested for the demo: pair a student's
// low-scoring phonemes with lessons tagged with matching phonemes.
// Pure function, no side effects, so it works identically against
// mock data now and real API data later.

const WEAK_ACCURACY_THRESHOLD = 60;

/**
 * @param {{symbol: string, accuracy: number}[]} weakPhonemes
 * @param {object[]} lessonCatalog - lessons with a `targetPhonemes: string[]` field
 * @param {number} [limit]
 * @returns {object[]} lessons ranked by how many of the student's weak
 *   phonemes they target, each annotated with `matchedPhonemes` and
 *   `weakestMatchAccuracy` so the UI can explain "why this lesson".
 */
export function recommendLessonsForWeakPhonemes(
  weakPhonemes,
  lessonCatalog,
  limit = 6,
) {
  const weakBySymbol = new Map(
    weakPhonemes
      .filter((phoneme) => phoneme.accuracy < WEAK_ACCURACY_THRESHOLD)
      .map((phoneme) => [phoneme.symbol, phoneme.accuracy]),
  );

  if (weakBySymbol.size === 0) {
    return [];
  }

  const scored = lessonCatalog
    .map((lesson) => {
      const matchedPhonemes = (lesson.targetPhonemes ?? []).filter((symbol) =>
        weakBySymbol.has(symbol),
      );

      if (matchedPhonemes.length === 0) {
        return null;
      }

      const weakestMatchAccuracy = Math.min(
        ...matchedPhonemes.map((symbol) => weakBySymbol.get(symbol)),
      );

      return {
        ...lesson,
        matchedPhonemes,
        weakestMatchAccuracy,
      };
    })
    .filter(Boolean);

  // Most matched phonemes first; ties broken by the weakest (lowest
  // accuracy) match, so the most urgent gap surfaces first.
  scored.sort((a, b) => {
    if (b.matchedPhonemes.length !== a.matchedPhonemes.length) {
      return b.matchedPhonemes.length - a.matchedPhonemes.length;
    }
    return a.weakestMatchAccuracy - b.weakestMatchAccuracy;
  });

  return scored.slice(0, limit);
}
