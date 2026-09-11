import { useState } from "react";

// Requirement 2 (Diagnostic Mentor Review Console): renders the
// normalized assessment chain (assessments -> word_assessments ->
// phoneme_assessments) mentorReviewController.getReviewAttemptDetails
// now includes per PracticeSession. `assessment` is that session's
// accepted (is_accepted=true) Assessment row, or null/undefined for a
// session predating the normalized schema — this component renders
// nothing in that case, exactly like the milestone widgets elsewhere in
// the app that skip rendering rather than fabricate data.

const WORD_STYLES = {
  exact_match: {
    label: "Match",
    className: "bg-green-100 text-green-800 border border-green-200",
  },
  substitution: {
    label: "Substitution",
    className: "bg-amber-100 text-amber-800 border border-amber-200",
  },
  deletion: {
    label: "Omitted",
    className: "bg-red-100 text-red-800 border border-red-200",
  },
  insertion: {
    label: "Insertion",
    className: "bg-blue-100 text-blue-800 border border-blue-200",
  },
};

function StatTile({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl px-4 py-3">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-800 mt-1">{value}</p>
    </div>
  );
}

function WordChip({ word, expanded, onToggle }) {
  const style = WORD_STYLES[word.operation] || WORD_STYLES.exact_match;
  const hasPhonemeErrors = (word.phonemes || []).some(
    (phoneme) => phoneme.operation !== "exact_match",
  );

  return (
    <button
      type="button"
      onClick={() => hasPhonemeErrors && onToggle(word.id)}
      className={`px-2.5 py-1 rounded-lg text-sm font-medium ${style.className} ${
        hasPhonemeErrors ? "cursor-pointer" : "cursor-default"
      }`}
      title={style.label}
    >
      {word.operation === "substitution" ? (
        <>
          <span className="line-through opacity-70">{word.expected_word}</span>
          {" → "}
          <span>{word.detected_word || "—"}</span>
        </>
      ) : word.operation === "deletion" ? (
        <span className="line-through">{word.expected_word}</span>
      ) : (
        <span>{word.detected_word || word.expected_word}</span>
      )}
      {hasPhonemeErrors && <span className="ml-1">{expanded ? "▴" : "▾"}</span>}
    </button>
  );
}

function SentenceDiagnostics({ assessment }) {
  const [expandedWordId, setExpandedWordId] = useState(null);

  if (!assessment) return null;

  const words = [...(assessment.words || [])].sort(
    (a, b) => a.word_index - b.word_index,
  );
  const expandedWord = words.find((word) => word.id === expandedWordId);

  return (
    <div className="mt-6 border-t pt-6">
      <h4 className="font-semibold text-gray-700 mb-4">Assessment Diagnostics</h4>

      {/* 1. Score & Outcome */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatTile label="Overall Accuracy" value={`${Number(assessment.overall_accuracy)}%`} />
        <StatTile label="Recognition" value={assessment.recognition_state || "—"} />
        <StatTile label="Exact Matches" value={assessment.exact_matches ?? 0} />
        <StatTile
          label="Substitutions / Deletions"
          value={`${assessment.substitutions ?? 0} / ${assessment.deletions ?? 0}`}
        />
      </div>

      {/* 2. Word-by-Word Differential */}
      {words.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-600 mb-2">
            Word-by-Word Differential
          </p>
          <div className="flex flex-wrap gap-2">
            {words.map((word) => (
              <WordChip
                key={word.id}
                word={word}
                expanded={expandedWordId === word.id}
                onToggle={(id) =>
                  setExpandedWordId((current) => (current === id ? null : id))
                }
              />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Green = exact match, amber = substitution (expected → detected), red = omitted,
            blue = inserted. Click a word with sound errors to see the phonetic breakdown.
          </p>
        </div>
      )}

      {/* 3. Phonetic Error Breakdown (for the expanded word) */}
      {expandedWord && (
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-600 mb-3">
            Phonetic errors in &ldquo;{expandedWord.expected_word}&rdquo;
          </p>
          <div className="space-y-2">
            {(expandedWord.phonemes || [])
              .filter((phoneme) => phoneme.operation !== "exact_match")
              .map((phoneme) => {
                const style = WORD_STYLES[phoneme.operation] || WORD_STYLES.substitution;
                const changedFeatures = phoneme.changed_features || [];
                return (
                  <div
                    key={phoneme.id}
                    className="flex items-center gap-3 text-sm bg-white rounded-lg px-3 py-2 border border-gray-200"
                  >
                    <span className="font-mono text-red-700">
                      /{phoneme.expected_symbol || "—"}/
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="font-mono text-gray-800">
                      /{phoneme.detected_symbol || "—"}/
                    </span>
                    {/* Discrete evidence only — no synthetic similarity
                        score persisted at the phoneme row level. The
                        comparison engine's actual output is this
                        operation plus, for a substitution, which
                        phonetic features changed. */}
                    <span
                      className={`ml-auto px-2 py-0.5 rounded-md text-xs font-medium ${style.className}`}
                    >
                      {style.label}
                    </span>
                    {changedFeatures.length > 0 && (
                      <span className="text-xs text-gray-500">
                        {changedFeatures.join(", ")}
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

export default SentenceDiagnostics;
