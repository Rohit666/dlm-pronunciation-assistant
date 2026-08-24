import { CheckCircle2, XCircle } from "lucide-react";
const PhonemeComparison = ({
  comparison,
  onSelectPhoneme,
  selectedPhoneme,
}) => {
  if (!comparison?.steps?.length) {
    return null;
  }

  return (
    <div>
      <div>
        <h3 className="text-xl font-bold text-gray-900">Phoneme Comparison</h3>

        <p className="mt-1 text-sm text-gray-500">
          See how each sound in your pronunciation compares with the expected
          sound.
        </p>
      </div>

      <div
        className="
    mt-5
    max-h-[360px]
    overflow-y-auto
    pr-2
    space-y-3
  "
      >
        {comparison.steps.map((step) => {
          const expected = step.expected?.symbol ?? "—";
          const detected = step.detected?.symbol ?? "—";
          const matched = step.matched === true;

          const selectable =
            step.expected !== null && step.expected !== undefined;

          const selected = selectedPhoneme?.index === step.index;

          return (
            <button
              key={step.index}
              type="button"
              disabled={!selectable}
              onClick={() => selectable && onSelectPhoneme?.(step)}
              className={`
                w-full
                rounded-2xl
                border
                p-4
                text-left
                transition-all
                duration-200

                ${
                  selected
                    ? "border-indigo-400 bg-indigo-50 shadow-md"
                    : matched
                      ? "border-emerald-200 bg-emerald-50 hover:border-emerald-300"
                      : "border-orange-200 bg-orange-50 hover:border-orange-300"
                }

                ${selectable ? "cursor-pointer" : "cursor-default"}
              `}
            >
              <div className="flex items-center gap-4">
                <div
                  className="
                    w-8
                    h-8
                    rounded-full
                    bg-white
                    border
                    border-gray-200
                    flex
                    items-center
                    justify-center
                    text-xs
                    font-semibold
                    text-gray-500
                    shrink-0
                  "
                >
                  {step.index + 1}
                </div>

                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500">Expected</p>

                  <p className="mt-1 text-2xl font-bold text-indigo-700">
                    {expected}
                  </p>
                </div>

                <div className="text-gray-400 text-xl">→</div>

                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500">
                    Your sound
                  </p>

                  <p
                    className={`
                      mt-1
                      text-2xl
                      font-bold
                      ${matched ? "text-emerald-700" : "text-orange-600"}
                    `}
                  >
                    {detected}
                  </p>
                </div>

                <div className="shrink-0">
                  {matched ? (
                    <CheckCircle2 size={24} className="text-emerald-600" />
                  ) : (
                    <XCircle size={24} className="text-orange-500" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PhonemeComparison;
