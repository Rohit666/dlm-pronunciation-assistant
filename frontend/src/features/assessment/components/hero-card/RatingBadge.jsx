import { Award } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getScoreMeta } from "../../utils/scoreUtils";

const RatingBadge = ({ score = 0 }) => {
  const [visible, setVisible] = useState(false);

  const meta = useMemo(() => getScoreMeta(score), [score]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 650);

    return () => clearTimeout(timer);
  }, []);

  const getStyles = () => {
    if (score >= 90) {
      return {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-700",
        icon: "text-emerald-500",
      };
    }

    if (score >= 75) {
      return {
        bg: "bg-indigo-50",
        border: "border-indigo-200",
        text: "text-indigo-700",
        icon: "text-indigo-500",
      };
    }

    if (score >= 60) {
      return {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-700",
        icon: "text-amber-500",
      };
    }

    return {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      icon: "text-red-500",
    };
  };

  const styles = getStyles();

  return (
    <div
      className={`
        inline-flex
        items-center
        gap-3
        px-4
        py-3
        rounded-full
        border
        shadow-sm
        transition-all
        duration-500
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
        ${styles.bg}
        ${styles.border}
      `}
    >
      <Award size={22} className={styles.icon} strokeWidth={2.2} />

      <span
        className={`
          text-lg
          font-bold
          ${styles.text}
        `}
      >
        {meta.badge}
      </span>
    </div>
  );
};

export default RatingBadge;
