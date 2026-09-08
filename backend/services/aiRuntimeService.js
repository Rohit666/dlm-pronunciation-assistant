const axios = require("axios");
const aiRuntime = axios.create({
  baseURL: process.env.AI_RUNTIME_URL,
  timeout: 120000,
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

module.exports = {
  health,
  transcribe,
  assess,
};
