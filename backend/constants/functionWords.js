// Closed-class English function words (pronouns, articles,
// prepositions, conjunctions, auxiliary/modal verbs, common
// determiners/quantifiers) — used by recommendationService's Grammar &
// Structural Path to measure substitution rate on structural words as
// opposed to content words. No existing schema classification for this,
// so it's a hardcoded list rather than a derived one; deliberately broad
// rather than exhaustive.
const FUNCTION_WORDS = new Set([
  // Articles / determiners
  "a", "an", "the", "this", "that", "these", "those", "some", "any", "no",
  "every", "each", "either", "neither", "both", "all", "another", "other",
  // Pronouns
  "i", "you", "he", "she", "it", "we", "they",
  "me", "him", "her", "us", "them",
  "my", "your", "his", "its", "our", "their",
  "mine", "yours", "hers", "ours", "theirs",
  "myself", "yourself", "himself", "herself", "itself", "ourselves", "themselves",
  "who", "whom", "whose", "which", "what",
  // Prepositions
  "in", "on", "at", "by", "for", "with", "about", "against", "between",
  "into", "through", "during", "before", "after", "above", "below",
  "to", "from", "up", "down", "over", "under", "of", "off", "out", "as",
  // Conjunctions
  "and", "but", "or", "nor", "so", "yet", "if", "because", "although",
  "while", "when", "since", "unless", "than", "though",
  // Auxiliary / modal verbs
  "am", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did",
  "will", "would", "shall", "should", "can", "could", "may", "might", "must",
]);

const isFunctionWord = (word) =>
  typeof word === "string" && FUNCTION_WORDS.has(word.trim().toLowerCase());

module.exports = { FUNCTION_WORDS, isFunctionWord };
