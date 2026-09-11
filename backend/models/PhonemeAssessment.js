const { parseJsonField } = require("../utils/jsonHelper");

// Discrete evidence only — see the remove-similarity-from-
// phoneme-assessments migration. No synthetic scalar score is stored at
// this row level; `matched` + `operation` are the comparison engine's
// actual boolean/categorical output, and expected_stress/
// expected_secondary_stress/expected_long/expected_category are the
// expected PhonemeToken's own attributes (ai-runtime
// app/models/phoneme_token.py), carried through verbatim.
module.exports = (sequelize, DataTypes) => {
  const PhonemeAssessment = sequelize.define(
    "PhonemeAssessment",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      word_assessment_id: { type: DataTypes.INTEGER, allowNull: false },

      position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

      expected_symbol: { type: DataTypes.STRING(16), allowNull: true },
      detected_symbol: { type: DataTypes.STRING(16), allowNull: true },

      // ai-runtime app/models/alignment_operation.py AlignmentOperation —
      // exact 4 values, kept in sync with the migration's ENUM.
      operation: {
        type: DataTypes.ENUM("exact_match", "substitution", "deletion", "insertion"),
        allowNull: false,
      },

      matched: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },

      expected_stress: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      expected_secondary_stress: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      expected_long: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      expected_category: { type: DataTypes.STRING(64), allowNull: true },

      // MariaDB's JSON type is LONGTEXT + CHECK(json_valid()), not a
      // native JSON column, so mysql2 never auto-parses it there — same
      // root cause documented on ExerciseQuestion.js's content_payload/
      // grading_rubric. parseJsonField also normalizes null/missing to
      // [], matching this column's always-array shape (a list of
      // changed phonetic feature names, e.g. ["voicing", "place"]).
      changed_features: {
        type: DataTypes.JSON,
        allowNull: true,
        get() {
          return parseJsonField(this.getDataValue("changed_features"));
        },
      },
    },
    {
      tableName: "phoneme_assessments",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  PhonemeAssessment.associate = (models) => {
    PhonemeAssessment.belongsTo(models.WordAssessment, {
      foreignKey: "word_assessment_id",
    });
  };

  return PhonemeAssessment;
};
