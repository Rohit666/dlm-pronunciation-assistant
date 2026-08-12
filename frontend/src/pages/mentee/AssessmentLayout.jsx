import usePracticePlayer from "../../features/practice/hooks/usePracticePlayer";
import RECOGNITION_STATES from "../../constants/recognitionStates";
import SuccessAssessment from "../../features/assessment/layouts/SuccessAssessment";
import PartialMatchAssessment from "../../features/assessment/layouts/PartialMatchAssessment";
import NoSpeechAssessment from "../../features/assessment/layouts/NoSpeechAssessment";
import NoMatchAssessment from "../../features/assessment/layouts/NoMatchAssessment";

const AssessmentLayout = () => {
  const { assessment, resetAssessmentForRetry } = usePracticePlayer();

  if (!assessment) {
    return null;
  }

  switch (assessment.recognition.state) {
    case RECOGNITION_STATES.SUCCESS:
      return <SuccessAssessment assessment={assessment} />;

    case RECOGNITION_STATES.PARTIAL_MATCH:
      return <PartialMatchAssessment assessment={assessment} />;

    case RECOGNITION_STATES.NO_SPEECH:
      return <NoSpeechAssessment assessment={assessment} />;

    case RECOGNITION_STATES.NO_MATCH:
      return <NoMatchAssessment assessment={assessment} />;

    default:
      return <NoMatchAssessment assessment={assessment} />;
  }
};

export default AssessmentLayout;
