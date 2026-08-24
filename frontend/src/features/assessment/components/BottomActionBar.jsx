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
    idle: "bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-lg",
    submitting: "bg-amber-500",
    success: "bg-emerald-600",
  };

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
        mt-8
        w-full
        rounded-3xl
        border
        border-gray-200
        bg-white
        shadow-sm
        overflow-hidden
      "
    >
      {/* =================================================
          ACTIONS
         ================================================= */}
      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-3
          sm:gap-4
          p-4
          sm:p-5
        "
      >
        {/* Submit - PRIMARY */}
        {showSubmit && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitState !== "idle" || submitting}
            className={`
              order-1
              md:order-2

              min-h-[52px]
              rounded-2xl

              px-5

              text-white
              font-semibold

              flex
              items-center
              justify-center
              gap-2.5

              transition-all
              duration-300
              shadow-md

              ${submitClasses[submitState]}

              disabled:cursor-not-allowed
              hover:-translate-y-0.5
            `}
          >
            {submitState === "idle" && (
              <>
                <CheckCircle2 size={19} />
                Submit Recording
              </>
            )}

            {submitState === "submitting" && (
              <>
                <Loader2 size={19} className="animate-spin" />
                Submitting...
              </>
            )}

            {submitState === "success" && (
              <>
                <CheckCircle2 size={19} className="animate-bounce" />
                Submitted Successfully
              </>
            )}
          </button>
        )}

        {/* Try Again - SECONDARY */}
        <button
          type="button"
          onClick={onTryAgain}
          className="
            order-2
            md:order-1

            min-h-[52px]
            rounded-2xl

            border-2
            border-indigo-200
            bg-white

            px-5

            text-indigo-700
            font-semibold

            flex
            items-center
            justify-center
            gap-2.5

            transition-all
            duration-300

            hover:bg-indigo-50
            hover:border-indigo-400
            hover:-translate-y-0.5

            group
          "
        >
          <RotateCcw
            size={19}
            className="
              transition-transform
              duration-300
              group-hover:-rotate-180
            "
          />
          Try Again
        </button>
      </div>

      {/* =================================================
          SECURITY MESSAGE
         ================================================= */}
      <div
        className="
          border-t
          border-gray-100
          px-4
          sm:px-6
          py-3.5
          sm:py-4

          flex
          items-start
          sm:items-center
          justify-center

          gap-2.5

          text-xs
          sm:text-sm
          text-gray-500
          text-center
          leading-5
        "
      >
        <Lock size={15} className="text-emerald-500 shrink-0 mt-0.5 sm:mt-0" />

        <span>
          Your recording will be securely saved and submitted to your mentor.
        </span>
      </div>
    </div>
  );
};

export default BottomActionBar;
