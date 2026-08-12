import { RotateCcw, CheckCircle2, Lock, Loader2 } from "lucide-react";
import { useState } from "react";
const BottomActionBar = ({
  onTryAgain,
  onSubmit,
  showSubmit = false,
  submitting = false,
}) => {
  const [submitState, setSubmitState] = useState("idle");
  const submitClasses = {
    idle: "bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-xl",

    submitting: "bg-amber-500",

    success: "bg-emerald-600",
  };
  // idle
  // submitting
  // success
  const handleSubmit = async () => {
    if (submitState !== "idle") return;

    setSubmitState("submitting");

    try {
      await onSubmit();

      setSubmitState("success");
    } catch (error) {
      console.error(error);
      setSubmitState("idle");
    }
  };
  return (
    <div
      className="
        mt-10
        rounded-3xl
        border
        border-gray-200
        bg-white
        shadow-sm
        overflow-hidden
      "
    >
      {/* Buttons */}

      <div
        className="
          flex
          flex-col
          md:flex-row
          gap-4
          p-6
        "
      >
        {/* Try Again */}

        <button
          onClick={onTryAgain}
          className="
            flex-1
            h-14
            rounded-2xl
            border-2
            border-indigo-200
            bg-white
            text-indigo-700
            font-semibold
            flex
            items-center
            justify-center
            gap-3
            transition-all
            duration-300
            hover:bg-indigo-50
            hover:border-indigo-400
            hover:-translate-y-0.5
            group
          "
        >
          <RotateCcw
            size={20}
            className="
              transition-transform
              duration-300
              group-hover:-rotate-180
            "
          />
          Try Again
        </button>

        {/* Submit */}

        {showSubmit && (
          <button
            onClick={handleSubmit}
            disabled={submitState !== "idle"}
            className={`
      flex-1
      h-14
      rounded-2xl
      text-white
      font-semibold
      flex
      items-center
      justify-center
      gap-3
      transition-all
      duration-500
      shadow-lg
      ${submitClasses[submitState]}
      disabled:cursor-not-allowed
      hover:-translate-y-0.5
    `}
          >
            {submitState === "idle" && (
              <>
                <CheckCircle2 size={20} />
                Submit Recording
              </>
            )}

            {submitState === "submitting" && (
              <>
                <Loader2 size={20} className="animate-spin" />
                Submitting...
              </>
            )}

            {submitState === "success" && (
              <>
                <CheckCircle2 size={20} className="animate-bounce" />
                Submitted Successfully
              </>
            )}
          </button>
        )}
      </div>

      {/* Footer */}

      <div
        className="
          border-t
          border-gray-100
          px-6
          py-4
          flex
          items-center
          justify-center
          gap-3
          text-sm
          text-gray-500
        "
      >
        <Lock size={16} className="text-emerald-500" />

        <span>
          Your recording will be securely saved and submitted to your mentor.
        </span>
      </div>
    </div>
  );
};

export default BottomActionBar;
