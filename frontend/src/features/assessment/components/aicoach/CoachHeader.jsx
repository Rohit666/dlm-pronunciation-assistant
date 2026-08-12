import ListenButton from "../ListenButton";
import { Bot } from "lucide-react";

const CoachHeader = ({ onListen }) => {
  return (
    <div className="flex justify-between items-start">
      <div className="flex gap-4">
        <div
          className="
            w-16
            h-16
            rounded-2xl
            bg-indigo-100
            flex
            items-center
            justify-center
          "
        >
          <Bot size={30} className="text-indigo-600" />
        </div>

        <div>
          <h3 className="text-3xl font-bold">Pronunciation Coach</h3>

          <p className="text-gray-500">Personal feedback</p>
        </div>
      </div>

      <ListenButton onClick={onListen} />
    </div>
  );
};

export default CoachHeader;
