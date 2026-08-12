import { CheckCircle2, AlertCircle } from "lucide-react";

const WordSelector = ({ words, selectedId, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-4">
      {words.map((word) => {
        const selected = selectedId === word.id;

        return (
          <button
            key={word.id}
            onClick={() => onSelect(word)}
            className={`
              flex items-center gap-2
              px-5 py-3
              rounded-2xl
              cursor-pointer
              border
              transition-all
              duration-300

              ${
                selected
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-lg"
                  : word.status === "correct"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    : "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
              }
            `}
          >
            <span className="font-semibold">{word.word}</span>
            {word.status === "correct" ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default WordSelector;
