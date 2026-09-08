import api from "./api";

// Permanent submit. No file upload — the recording was already sent to
// /practice/compare, which created (or reused) the practice_session and
// returned its id. This just redeems the cached assessment_token into
// that session's accepted, permanently-persisted submission.
export const submitPractice = async ({ practiceSessionId, assessmentToken }) => {
  const response = await api.post("/practice", {
    practice_session_id: practiceSessionId,
    assessment_token: assessmentToken,
  });

  return response.data;
};

// Transient compare. Never persisted server-side beyond the short-lived
// assessment_token cache — returns the AI evaluation plus that token so
// a later submitPractice() call can redeem it.
export const comparePractice = async ({
  lessonSentenceId,
  practiceAttemptId,
  audioBlob,
}) => {
  const formData = new FormData();
  formData.append("lessonSentenceId", lessonSentenceId);
  formData.append("practiceAttemptId", practiceAttemptId);
  formData.append("recording", audioBlob, `practice-${Date.now()}.webm`);

  const response = await api.post("/practice/compare", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
