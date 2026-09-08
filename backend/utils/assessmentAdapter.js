// Validates + normalizes a raw ai-runtime SpeechAssessmentResponse
// payload into the shape the normalized assessment tables expect.
// Mirrors (and is the DB-write counterpart of) the existing client-side
// frontend/src/features/assessment/adapter/assessmentAdapter.js, which
// already reads this exact response shape for the UI.
//
// Source fields, confirmed against ai-runtime/app/models:
//   assessment_document.pronunciation  -> PronunciationAssessment
//   assessment_document.words[]        -> WordAssessment (canonical —
//                                          assessment_document.sentences[]
//                                          .words repeats the same
//                                          objects and is intentionally
//                                          NOT read here)
//   word.pronunciation.phoneme_comparison.steps[] -> PhonemeComparisonStep
//     .expected / .detected            -> PhonemeToken (symbol)
//     .relationship                    -> RelationshipResult
//       (target_symbol, similarity, penalty, changed_features, explanation)
//   recognition                        -> RecognitionStatus
//   diagnosis                          -> LearningDiagnosis
//   diagnosis.needs[]                  -> LearningNeed
//   feedback / trace                   -> stored verbatim in the snapshot,
//                                          not normalized into rows

class AssessmentValidationError extends Error {}

function assertRange(value, min, max, label) {
  if (typeof value !== "number" || Number.isNaN(value) || value < min || value > max) {
    throw new AssessmentValidationError(
      `${label} must be a number between ${min} and ${max}, got ${JSON.stringify(value)}`,
    );
  }
}

function normalizePhonemeSteps(word) {
  const steps = word?.pronunciation?.phoneme_comparison?.steps;
  if (!Array.isArray(steps)) return [];

  return steps
    .filter((step) => step?.expected || step?.detected)
    .map((step) => ({
      expected_symbol: step.expected?.symbol ?? null,
      detected_symbol: step.detected?.symbol ?? null,
      operation: step.operation ?? "exact_match",
      similarity:
        typeof step.relationship?.similarity === "number"
          ? step.relationship.similarity
          : null,
      changed_features: step.relationship?.changed_features ?? [],
    }));
}

function normalizeWord(word, index) {
  const accuracy = typeof word.accuracy === "number" ? word.accuracy : 0;
  assertRange(accuracy, 0, 100, `assessment_document.words[${index}].accuracy`);

  const confidence = typeof word.confidence === "number" ? word.confidence : 0;
  assertRange(
    confidence,
    0,
    1,
    `assessment_document.words[${index}].confidence`,
  );

  if (!word.word) {
    throw new AssessmentValidationError(
      `assessment_document.words[${index}].word is required`,
    );
  }

  return {
    word_index: index,
    expected_word: word.word,
    // Python naming: student_word -> detected_word.
    detected_word: word.student_word ?? null,
    operation: word.operation ?? "exact_match",
    accepted: Boolean(word.accepted),
    confidence,
    accuracy,
    weak_phonemes: word.weak_phonemes ?? [],
    phonemes: normalizePhonemeSteps(word),
  };
}

function normalizeDiagnosis(diagnosis) {
  if (!diagnosis) return null;

  const confidence =
    typeof diagnosis.confidence === "number" ? diagnosis.confidence : 0;
  assertRange(confidence, 0, 1, "diagnosis.confidence");

  return {
    overall_accuracy: diagnosis.overall_accuracy ?? 0,
    cefr_estimate: diagnosis.cefr_estimate ?? null,
    confidence,
    strengths: diagnosis.strengths ?? [],
    needs: (diagnosis.needs ?? []).map((need) => ({
      type: need.type,
      target: need.target,
      occurrences: need.occurrences ?? 0,
      substitutions: need.substitutions ?? 0,
      deletions: need.deletions ?? 0,
      attributes: need.attributes ?? [],
    })),
  };
}

/**
 * @param {object} raw - raw ai-runtime SpeechAssessmentResponse JSON
 * @returns {{
 *   assessment: object,
 *   words: Array<object & { phonemes: object[] }>,
 *   diagnosis: object|null,
 *   snapshot: { raw_payload: object, feedback_snapshot: object|null, trace: object|null },
 * }}
 * @throws {AssessmentValidationError} on malformed/out-of-range input
 */
function normalizeAssessmentPayload(raw) {
  const pronunciation = raw?.assessment_document?.pronunciation;
  const words = raw?.assessment_document?.words;
  const recognition = raw?.recognition;

  if (!pronunciation) {
    throw new AssessmentValidationError(
      "assessment_document.pronunciation is missing",
    );
  }
  if (!Array.isArray(words)) {
    throw new AssessmentValidationError(
      "assessment_document.words must be an array",
    );
  }

  const overallAccuracy =
    typeof pronunciation.overall_accuracy === "number"
      ? pronunciation.overall_accuracy
      : null;
  assertRange(overallAccuracy, 0, 100, "pronunciation.overall_accuracy");

  const assessment = {
    overall_accuracy: overallAccuracy,
    total_reference: pronunciation.total_reference ?? 0,
    exact_matches: pronunciation.exact_matches ?? 0,
    substitutions: pronunciation.substitutions ?? 0,
    insertions: pronunciation.insertions ?? 0,
    deletions: pronunciation.deletions ?? 0,
    recognition_state: recognition?.state ?? null,
    recognition_success: Boolean(recognition?.success),
    recognized_words: recognition?.recognized_words ?? 0,
    total_words: recognition?.total_words ?? 0,
    expected_text: recognition?.expected_text ?? "",
    detected_text: recognition?.detected_text ?? "",
    transcript: raw?.transcript ?? "",
  };

  return {
    assessment,
    words: words.map(normalizeWord),
    diagnosis: normalizeDiagnosis(raw?.diagnosis),
    snapshot: {
      raw_payload: raw,
      feedback_snapshot: raw?.feedback ?? null,
      trace: raw?.trace ?? null,
    },
  };
}

module.exports = { normalizeAssessmentPayload, AssessmentValidationError };
