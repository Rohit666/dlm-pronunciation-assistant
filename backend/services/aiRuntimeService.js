const axios = require("axios");
const aiRuntime = axios.create({
  baseURL: process.env.AI_RUNTIME_URL,
  timeout: 120000,
});
const { LessonSentence, PracticeAttempt } = require("../models");
const path = require("path");

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
const compare = async (req) => {
  const { lessonSentenceId, practiceAttemptId } = req.body;
  const audioPath = path.resolve(req.file.path);
  const lessonSentence = await LessonSentence.findByPk(lessonSentenceId);
  if (!lessonSentence) {
    throw new Error("Lesson sentence not found.");
  }
  const payload = {
    audio_path: audioPath,
    reference_text: lessonSentence.sentence_text,
    language: "en",
  };
  const response = await aiRuntime.post("/practice/assess", payload);
  return response.data;
};

module.exports = {
  health,
  transcribe,
  compare,
};
