const axios = require("axios");
const { baseUrl: AI_RUNTIME_BASE_URL } = require("../config/aiRuntime");

const aiRuntime = axios.create({
  baseURL: process.env.AI_RUNTIME_URL,
  timeout: 120000,
});

// Milestone 10 — separate short-timeout client for paragraph grading.
// Deliberately NOT the shared `aiRuntime` instance above: that one's
// 120s timeout exists for genuinely slow work (audio transcription/
// pronunciation assessment) where there's no fallback and the caller
// must wait. Paragraph grading has a synchronous local fallback
// (exerciseEvaluationService's gradeParagraphFallback) specifically so
// a slow/offline AI runtime never blocks exercise submission — a 120s
// hang before falling back would defeat that purpose. Also uses
// config/aiRuntime.js's defaulted baseUrl (falls back to
// http://127.0.0.1:8001) rather than the shared instance's bare
// `process.env.AI_RUNTIME_URL` (undefined baseURL if that env var
// isn't set) — this call needs to work out of the box in dev.
const paragraphEvaluator = axios.create({
  baseURL: AI_RUNTIME_BASE_URL,
  timeout: 4000,
});

const health = async () => {
  const response = await aiRuntime.get("/health");
  return response.data;
};

const transcribe = async (audioPath, language = "en") => {
  const response = await aiRuntime.post("/speech/transcribe", {
    audioPath,
    language,
  });

  return response.data;
};

// Pure passthrough to the Python AI runtime — no persistence, no
// lookups. Orchestration (lesson sentence lookup, mentee lookup,
// caching the result behind an assessment_token) lives in
// practiceController.compare, which is the transient half of the
// Transient Compare vs. Permanent Submit split.
const assess = async ({ audioPath, referenceText, language = "en" }) => {
  const response = await aiRuntime.post("/practice/assess", {
    audio_path: audioPath,
    reference_text: referenceText,
    language,
  });

  return response.data;
};

// Milestone 10 — offline subjective paragraph evaluator passthrough.
// attemptAnswerId is nullable: exerciseEvaluationService grades every
// question before the exercise_attempt_answers rows exist (their ids
// are assigned by the DB on the bulkCreate after grading finishes), so
// there is no real id to send at call time — see the matching comment
// on ParagraphEvaluationRequest in the Python runtime. Throws on any
// failure (offline runtime, timeout, 4xx/5xx) — the caller is
// responsible for catching this and falling back, never this layer.
const evaluateParagraph = async ({ attemptAnswerId, prompt, studentText, rubric }) => {
  const response = await paragraphEvaluator.post("/evaluate/paragraph", {
    attempt_answer_id: attemptAnswerId ?? null,
    prompt,
    student_text: studentText,
    rubric,
  });

  return response.data;
};

module.exports = {
  health,
  transcribe,
  assess,
  evaluateParagraph,
};
