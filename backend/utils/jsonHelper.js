exports.parseJsonField = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }

  return [];
};

// Generic JSON-column normalizer, any shape (object/array/scalar) —
// unlike parseJsonField above it never coerces to an array, and passes
// null/undefined through unchanged (a JSON-NULL column should read as
// null, not {}).
//
// Root cause this exists for: MariaDB's JSON type is LONGTEXT + a
// CHECK(json_valid()) constraint, not a true native JSON column (see
// the hierarchical-content-tree migration notes). mysql2 only
// auto-parses a column the wire protocol reports as its native JSON
// type; on MariaDB that never fires, so Sequelize hands back the raw
// string on real MySQL 5.7+/8 (true JSON column type) this is a no-op
// since the value already arrives parsed.
exports.parseJsonValue = (value) => {
  if (value === null || value === undefined) return value;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};
