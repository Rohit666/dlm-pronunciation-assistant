import { useState } from "react";
import PracticePlayerContext from "./PracticePlayerContext";
import { useNavigate } from "react-router-dom";
import { submitPractice } from "../../../services/practiceService";
import {
  completePracticeAttempt,
  updatePracticeProgress,
} from "../../../services/practiceAttemptService";
import { ROUTES } from "../../../constants/routes";

const PracticePlayerProvider = ({ lessonId, attemptId, children }) => {
  const navigate = useNavigate();
  /*
   * UI Stage
   */

  const [stage, setStage] = useState("recording");
  const [error, setError] = useState(null);
  /*
   * Lesson
   */

  const [lesson, setLesson] = useState(null);

  const [sentences, setSentences] = useState([]);

  const [currentIndex, setCurrentIndex] = useState(0);

  /*
   * Attempt
   */

  const [practiceAttempt, setPracticeAttempt] = useState(null);

  /*
   * Recording
   */

  /*
   * Assessment
   */

  const [assessment, setAssessment] = useState(null);

  // One-time token from /practice/compare, redeemed by /practice
  // (submitPractice) to persist that exact evaluation as the accepted
  // submission. Cleared after use so a stale token is never resent.
  const [assessmentToken, setAssessmentToken] = useState(null);

  // practice_session_id returned by that same /compare call — the
  // session it created (or reused) for this sentence. /practice
  // (submitPractice) now targets this id directly instead of
  // re-deriving a session from lessonSentenceId/attemptId.
  const [practiceSessionId, setPracticeSessionId] = useState(null);

  /*
   * Loading
   */

  const [loading, setLoading] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const currentSentence = sentences[currentIndex] ?? null;
  const [submitting, setSubmitting] = useState(false);
  const retryRecording = () => {
    setAudioBlob(null);
    setAssessment(null);
    setAssessmentToken(null);
    setPracticeSessionId(null);
    setError(null);
    setStage("recording");
  };
  const submitRecording = async () => {
    if (!audioBlob || !currentSentence) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await submitPractice({
        practiceSessionId,
        assessmentToken,
      });

      const isLastSentence = currentIndex === sentences.length - 1;

      if (isLastSentence) {
        await completePracticeAttempt(attemptId);

        navigate(`${ROUTES.MENTEE_PRACTICE}/${lessonId}/complete/${attemptId}`);

        return;
      }

      const nextSentenceOrder = currentIndex + 2;

      await updatePracticeProgress(attemptId, nextSentenceOrder);

      setPracticeAttempt((previous) => ({
        ...previous,
        current_sentence_order: nextSentenceOrder,
      }));

      setCurrentIndex((previous) => previous + 1);

      setAssessment(null);
      setAssessmentToken(null);
      setPracticeSessionId(null);
      setAudioBlob(null);
      setStage("recording");
    } catch (error) {
      console.error(error);
      setError(error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  };
  const value = {
    lessonId,
    attemptId,

    error,
    setError,
    /*
     * Stage
     */

    stage,
    setStage,

    /*
     * Lesson
     */

    lesson,
    setLesson,

    sentences,
    setSentences,

    currentIndex,
    setCurrentIndex,

    /*
     * Attempt
     */

    practiceAttempt,
    setPracticeAttempt,

    /*
     * Assessment
     */

    assessment,
    setAssessment,

    assessmentToken,
    setAssessmentToken,

    practiceSessionId,
    setPracticeSessionId,

    /*
     * Loading
     */

    loading,
    setLoading,

    audioBlob,
    setAudioBlob,
    retryRecording,
    submitting,
    submitRecording,
  };

  return (
    <PracticePlayerContext.Provider value={value}>
      {children}
    </PracticePlayerContext.Provider>
  );
};

export default PracticePlayerProvider;
