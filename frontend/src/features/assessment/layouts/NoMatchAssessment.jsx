import AssessmentStatusCard from "../components/AssessmentStatusCard";
import BottomActionBar from "../components/BottomActionBar";
import usePracticePlayer from "../../../features/practice/hooks/usePracticePlayer";

const NoMatchAssessment = ({ assessment }) => {
  const { retryRecording } = usePracticePlayer();
  return (
    <AssessmentStatusCard
      state="no_match"
      title={assessment.recognition.title}
      message={assessment.recognition.message}
      expectedSentence={assessment.recognition.expectedText}
      detectedSentence={assessment.recognition.detectedText}
      tips={[
        "Listen to the sentence once more.",
        "Speak naturally without rushing.",
        "Avoid background noise while recording.",
      ]}
      action={
        <BottomActionBar showSubmit={false} onTryAgain={retryRecording} />
      }
    />
  );
};

export default NoMatchAssessment;
