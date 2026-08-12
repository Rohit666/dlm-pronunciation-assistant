import { CheckCircle2, AlertTriangle, MicOff, XCircle } from "lucide-react";

import RecognitionWave from "./RecognitionWave";

const STATES = {
  success: {
    icon: CheckCircle2,
    iconColor: "text-emerald-600",
    bg: "bg-emerald-50/70",
    border: "border-emerald-100",
    titleColor: "text-emerald-700",
  },

  partial_match: {
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    bg: "bg-amber-50/70",
    border: "border-amber-100",
    titleColor: "text-amber-600",
  },

  no_match: {
    icon: XCircle,
    iconColor: "text-red-500",
    bg: "bg-red-50/70",
    border: "border-red-100",
    titleColor: "text-red-600",
  },

  no_speech: {
    icon: MicOff,
    iconColor: "text-gray-500",
    bg: "bg-gray-50",
    border: "border-gray-200",
  },
};

const RecognitionPanel = ({ state, title, message }) => {
  const theme = STATES[state] || STATES.success;

  const Icon = theme.icon;

  return (
    <div
      className={`
        w-full
      rounded-3xl
      border
      ${theme.bg}
      ${theme.border}
      p-8
    `}
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Icon size={25} className={theme.iconColor} />

            <h3
              className="
              text-2xl font-semibold
              ${theme.titleColor}
            "
            >
              {title}
            </h3>
          </div>

          <p
            className="
            mt-4
            text-gray-600
            leading-8
          "
          >
            {message}
          </p>
        </div>
        <div className="flex items-center self-stretch">
          <RecognitionWave state={state} />
        </div>
      </div>
    </div>
  );
};

export default RecognitionPanel;
