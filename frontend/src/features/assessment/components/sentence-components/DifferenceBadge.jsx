import { AlertCircle } from "lucide-react";

const DifferenceBadge = ({ count }) => {
  if (!count) return null;

  return (
    <div
      className="
        inline-flex
        items-center
        gap-2
        px-4
        py-2
        rounded-2xl
        border
        border-orange-200
        bg-orange-50
        text-orange-600
        font-medium
      "
    >
      <AlertCircle size={18} />
      {count}{" "}
      {count === 1 ? "word sounded different" : "words sounded different"}
    </div>
  );
};

export default DifferenceBadge;
