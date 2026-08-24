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
        lessonSentenceId: currentSentence.id,
        practiceAttemptId: attemptId,
        audioBlob,
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
