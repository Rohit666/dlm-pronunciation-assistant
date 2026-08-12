import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { getScoreMeta } from "../../utils/scoreUtils";

const StarRating = ({ score = 0 }) => {
  const [animatedWidth, setAnimatedWidth] = useState(0);

  const meta = useMemo(() => getScoreMeta(score), [score]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(score);
    }, 300);

    return () => clearTimeout(timer);
  }, [score]);

  const StarRow = ({ className }) => (
    <div className={`flex gap-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((index) => (
        <Star key={index} size={28} strokeWidth={2} className="shrink-0" />
      ))}
    </div>
  );

  return (
    <div className="relative inline-flex">
      {/* Background Stars */}

      <StarRow className="text-gray-300" />

      {/* Filled Stars */}

      <div
        className="absolute left-0 top-0 overflow-hidden transition-all duration-700 ease-out"
        style={{
          width: `${animatedWidth}%`,
        }}
      >
        <StarRow className="text-yellow-400 fill-yellow-400" />
      </div>
    </div>
  );
};

export default StarRating;
