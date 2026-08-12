import { Lightbulb } from "lucide-react";

const RecommendationCard = ({ recommendation }) => {
  return (
    <div
      className="
        rounded-2xl
        bg-indigo-50
        border
        border-indigo-100
        p-5
      "
    >
      <div className="flex items-center gap-3">
        <Lightbulb size={22} className="text-indigo-600" />

        <h4
          className="
            text-lg
            font-bold
            text-indigo-700
          "
        >
          Recommendation
        </h4>
      </div>

      <p
        className="
          mt-3
          leading-7
          text-gray-700
        "
      >
        {recommendation}
      </p>
    </div>
  );
};

export default RecommendationCard;
