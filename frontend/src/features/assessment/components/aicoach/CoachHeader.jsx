import ListenButton from "../ListenButton";
import { Bot } from "lucide-react";

const CoachHeader = ({ onListen }) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="
            w-12
            h-12
            shrink-0
            rounded-2xl
            bg-indigo-100
            flex
            items-center
            justify-center
          "
        >
          <Bot size={24} className="text-indigo-600" />
        </div>

        <div className="min-w-0">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
            Pronunciation Coach
          </h3>

          <p className="mt-0.5 text-sm text-gray-500">Personal feedback</p>
        </div>
      </div>

      <div className="shrink-0">
        <ListenButton onClick={onListen} />
      </div>
    </div>
  );
};

export default CoachHeader;
