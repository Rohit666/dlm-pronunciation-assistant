// Shared rounding helper for analytics aggregates coming back from raw
// SQL (MySQL DECIMAL/AVG results arrive as strings via mysql2) — casts
// to Number and rounds to 2 decimal places. Returns null through
// unchanged so callers can tell "no data" apart from a real zero.
function round2(value) {
  if (value === null || value === undefined) {
    return null;
  }
  return Math.round(Number(value) * 100) / 100;
}

module.exports = { round2 };
