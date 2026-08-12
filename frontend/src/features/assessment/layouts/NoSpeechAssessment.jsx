import AssessmentStatusCard from "../components/AssessmentStatusCard";
import BottomActionBar from "../components/BottomActionBar";
import usePracticePlayer from "../../../features/practice/hooks/usePracticePlayer";

const NoSpeechAssessment = ({ assessment }) => {
  const { retryRecording } = usePracticePlayer();
  return (
    <AssessmentStatusCard
      state="no_speech"
      title={assessment.recognition.title}
      message={assessment.recognition.message}
      tips={[
        "Check that your microphone is connected.",
        "Speak a little louder.",
        "Move closer to the microphone.",
        "Record in a quiet environment.",
      ]}
      action={
        <BottomActionBar showSubmit={false} onTryAgain={retryRecording} />
      }
    />
  );
};

export default NoSpeechAssessment;
