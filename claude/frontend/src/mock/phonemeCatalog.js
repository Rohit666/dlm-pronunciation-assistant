// Shared phoneme reference used by the mentee "Fix Your Weak Sounds"
// carousel and the mentor class-wide phoneme heatmap, so both features
// speak the same phoneme vocabulary. Mirrors the confusable-pair
// examples called out in the SRS (/θ/ vs /s/, /v/ vs /w/, /r/ vs /l/).
export const PHONEME_CATALOG = [
  { symbol: "θ", ipa: "/θ/", label: "th (thin)", example: "think" },
  { symbol: "ð", ipa: "/ð/", label: "th (this)", example: "this" },
  { symbol: "r", ipa: "/r/", label: "r", example: "red" },
  { symbol: "l", ipa: "/l/", label: "l", example: "light" },
  { symbol: "v", ipa: "/v/", label: "v", example: "very" },
  { symbol: "w", ipa: "/w/", label: "w", example: "west" },
  { symbol: "ʃ", ipa: "/ʃ/", label: "sh", example: "ship" },
  { symbol: "z", ipa: "/z/", label: "z", example: "zoo" },
];

export const phonemeLabel = (symbol) =>
  PHONEME_CATALOG.find((phoneme) => phoneme.symbol === symbol)?.label ??
  symbol;
