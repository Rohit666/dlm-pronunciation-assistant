import { Volume2 } from "lucide-react";

const ListenButton = ({ onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="
inline-flex
items-center
gap-2
px-5
py-2.5
rounded-xl
bg-indigo-600
text-white
font-medium
shadow-sm
transition-all
duration-300
hover:bg-indigo-700
hover:scale-105
active:scale-95
"
    >
      <Volume2 size={18} />
      Listen
    </button>
  );
};

export default ListenButton;
