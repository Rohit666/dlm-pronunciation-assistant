import { useEffect, useRef, useState } from "react";

import usePracticePlayer from "../../features/practice/hooks/usePracticePlayer";

import { comparePractice } from "../../services/practiceService";
import { adaptAssessment } from "../../features/assessment/adapter/assessmentAdapter";

import AssessmentCard from "../../components/common/AssessmentCard";
import LoadingWave from "../../features/loading/components/LoadingWave";
import LoadingStep from "../../features/loading/components/LoadingStep";
import LoadingProgressBar from "../../features/loading/components/LoadingProgressBar";

const PronunciationLoadingPage = () => {
  const {
    attemptId,
    audioBlob,
    sentences,
    currentIndex,
    setAssessment,
    setAssessmentToken,
    setPracticeSessionId,
    setStage,
  } = usePracticePlayer();

  const currentSentence = sentences[currentIndex];

  const steps = [
    "Listening to your recording",
    "Recognising spoken words",
    "Comparing pronunciation",
    "Detecting learning needs",
    "Preparing personalised feedback",
  ];

  const [currentStep, setCurrentStep] = useState(0);

  const hasStartedRef = useRef(false);

  /*
   * --------------------------------------------------
   * Start assessment
   * --------------------------------------------------
   */
  useEffect(() => {
    if (hasStartedRef.current || !audioBlob || !currentSentence || !attemptId) {
      return;
    }

    hasStartedRef.current = true;

    const processAssessment = async () => {
      try {
        const response = await comparePractice({
          lessonSentenceId: currentSentence.id,
          practiceAttemptId: attemptId,
          audioBlob,
        });
        console.log("comparePractice response:", response);
        const adaptedAssessment = adaptAssessment(response.result);

        setAssessment(adaptedAssessment);
        setAssessmentToken(response.assessment_token);
        setPracticeSessionId(response.practice_session_id);

        setCurrentStep(steps.length - 1);

        setTimeout(() => {
          setStage("assessment");
        }, 300);
      } catch (error) {
        console.error("Failed to analyse pronunciation:", error);
      }
    };

    processAssessment();
  }, [
    audioBlob,
    currentSentence,
    attemptId,
    setAssessment,
    setAssessmentToken,
    setPracticeSessionId,
    setStage,
  ]);
  /*
   * --------------------------------------------------
   * Loading animation
   * --------------------------------------------------
   */

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((previous) => {
        /*
         * Don't advance beyond the final step.
         *
         * The API controls completion.
         */
        if (previous < steps.length - 1) {
          return previous + 1;
        }

        return previous;
      });
    }, 900);

    return () => {
      clearInterval(interval);
    };
  }, []);

  /*
   * --------------------------------------------------
   * Progress
   * --------------------------------------------------
   */

  const progress = Math.min(((currentStep + 1) / steps.length) * 90, 90);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
      <AssessmentCard className="max-w-3xl w-full p-12">
        <div className="flex flex-col items-center">
          <LoadingWave />

          <h1 className="mt-6 text-4xl font-bold text-gray-900">
            Analysing Your Audio
          </h1>

          <p className="mt-4 text-lg text-center text-gray-500 max-w-xl">
            Our AI is listening, analysing and comparing your audio.
            <br />
            This usually takes only a few seconds.
          </p>
        </div>

        <hr className="my-10 border-gray-100" />

        <div className="space-y-3">
          {steps.map((step, index) => {
            let status = "pending";

            if (index < currentStep) {
              status = "completed";
            } else if (index === currentStep) {
              status = "active";
            }

            return <LoadingStep key={step} title={step} status={status} />;
          })}
        </div>

        <div className="mt-10">
          <LoadingProgressBar progress={progress} />
        </div>

        <hr className="my-10" />

        <div className="text-center">
          <p className="text-xl text-gray-700 font-medium">
            Please don't close this page.
          </p>

          <p className="mt-3 text-gray-500">
            Your personalised feedback is being prepared.
          </p>
        </div>
      </AssessmentCard>
    </div>
  );
};

export default PronunciationLoadingPage;
