import { Lightbulb } from "lucide-react";

const TipBubble = ({ tip }) => {
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
      <div className="flex gap-3">
        <Lightbulb className="text-amber-600 mt-1" size={20} />

        <p
          className="
            text-gray-700
            leading-7
          "
        >
          {tip}
        </p>
      </div>
    </div>
  );
};

export default TipBubble;
