import { AlertTriangle } from "lucide-react";

const IssueCard = ({ issue }) => {
  return (
    <div
      className="
        rounded-2xl
        bg-amber-50
        border
        border-amber-200
        p-5
      "
    >
      <div className="flex items-center gap-3">
        <AlertTriangle className="text-amber-600" size={22} />

        <h4
          className="
            text-lg
            font-bold
            text-amber-700
          "
        >
          Pronunciation Issue
        </h4>
      </div>

      <p
        className="
          mt-3
          text-gray-700
          leading-7
        "
      >
        {issue}
      </p>
    </div>
  );
};

export default IssueCard;
