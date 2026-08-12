import { useParams } from "react-router-dom";

import PracticePlayerProvider from "../../features/practice/context/PracticePlayerProvider";
import usePracticePlayer from "../../features/practice/hooks/usePracticePlayer";

import LessonPracticePlayer from "./LessonPracticePlayer";
import PronunciationLoadingPage from "./PronunciationLoadingPage";
import AssessmentLayout from "./AssessmentLayout";

const PracticePlayerContent = () => {
  const { stage } = usePracticePlayer();

  switch (stage) {
    case "loading":
      return <PronunciationLoadingPage />;

    case "assessment":
      return <AssessmentLayout />;

    default:
      return <LessonPracticePlayer />;
  }
};

const PracticePlayerPage = () => {
  const { lessonId, attemptId } = useParams();

  return (
    <PracticePlayerProvider lessonId={lessonId} attemptId={attemptId}>
      <PracticePlayerContent />
    </PracticePlayerProvider>
  );
};

export default PracticePlayerPage;
