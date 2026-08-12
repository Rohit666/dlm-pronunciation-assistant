import api from "./api";

export const submitPractice = async ({
  lessonSentenceId,
  practiceAttemptId,
  audioBlob,
}) => {
  const formData = new FormData();

  formData.append("lesson_sentence_id", lessonSentenceId);
  formData.append("practice_attempt_id", practiceAttemptId);
  formData.append("recording", audioBlob, `practice-${Date.now()}.webm`);

  const response = await api.post("/practice", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
export const comparePractice = async ({
  lessonSentenceId,
  practiceAttemptId,
  audioBlob,
}) => {
  const formData = new FormData();
  formData.append("lessonSentenceId", lessonSentenceId);
  formData.append("practiceAttemptId", practiceAttemptId);
  formData.append("recording", audioBlob, `practice-${Date.now()}.webm`);

  const response = await api.post("/ai-runtime/compare", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
