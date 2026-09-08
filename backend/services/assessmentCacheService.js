const crypto = require("crypto");

// Transient store for /practice/compare results, keyed by a one-time
// assessment_token. Never touches the DB — permanent tables state's
// only writer is /practice/submit (practiceController.submit), which
// redeems a token here. In-memory Map per the spec ("in-memory Map or
// short-lived token store"); fine for a single-process deployment —
// swap for Redis if this ever runs behind more than one Node instance.

const TTL_MS = 10 * 60 * 1000; // 10 minutes — long enough to review the
// assessment card and decide to submit, short enough not to leak memory.

const cache = new Map();

function sweepExpired() {
  const now = Date.now();
  for (const [token, entry] of cache) {
    if (entry.expiresAt <= now) {
      cache.delete(token);
    }
  }
}

// Cheap opportunistic sweep — runs on every write, so an idle server
// never needs its own timer/interval to stay clean.
//
// Takes the whole entry as one object (rather than a fixed destructured
// list) so callers can carry extra fields — practiceSessionId,
// overallScore, tryPersisted, tryNumber — without this function needing
// to change every time the compare/submit contract grows.
function put(entry) {
  sweepExpired();

  const token = crypto.randomUUID();
  cache.set(token, {
    ...entry,
    expiresAt: Date.now() + TTL_MS,
  });

  return token;
}

// Single-use redemption: returns the cached entry and deletes it, or
// null if the token is unknown/expired/already redeemed. Deleting on
// read prevents a token being spent twice (e.g. a double-submit click).
function redeem(token) {
  const entry = cache.get(token);
  if (!entry) return null;

  cache.delete(token);

  if (entry.expiresAt <= Date.now()) {
    return null;
  }

  return entry;
}

module.exports = { put, redeem };
