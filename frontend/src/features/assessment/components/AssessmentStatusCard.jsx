import AssessmentCard from "../../../components/common/AssessmentCard";
import RecognitionPanel from "./RecognitionPanel";
import { CheckCircle } from "lucide-react";

const AssessmentStatusCard = ({
  state,
  title,
  message,
  expectedSentence,
  detectedSentence,
  tips = [],
  action,
}) => {
  return (
    <div className="space-y-6">
      <RecognitionPanel state={state} title={title} message={message} />

      <AssessmentCard>
        {(expectedSentence || detectedSentence) && (
          <div className="grid lg:grid-cols-2 gap-6">
            {expectedSentence && (
              <div
                className="
                  rounded-2xl
                  bg-indigo-50
                  border
                  border-indigo-100
                  p-6
                "
              >
                <p className="text-sm uppercase tracking-wider text-indigo-500">
                  Expected Sentence
                </p>

                <p className="mt-3 text-xl font-medium text-gray-900">
                  {expectedSentence}
                </p>
              </div>
            )}

            {detectedSentence && (
              <div
                className="
                  rounded-2xl
                  bg-red-50
                  border
                  border-red-100
                  p-6
                "
              >
                <p className="text-sm uppercase tracking-wider text-red-500">
                  We Heard
                </p>

                <p className="mt-3 text-xl font-medium text-gray-900">
                  {detectedSentence}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-900">Suggestions</h3>

          <div className="mt-5 space-y-4">
            {tips.map((tip) => (
              <div key={tip} className="flex items-start gap-3">
                <CheckCircle
                  size={20}
                  className="text-indigo-600 mt-1 shrink-0"
                />

                <p className="leading-7 text-gray-600">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </AssessmentCard>

      {action}
    </div>
  );
};

export default AssessmentStatusCard;
