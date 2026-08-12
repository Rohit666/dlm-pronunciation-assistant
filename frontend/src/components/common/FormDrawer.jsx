import { X } from "lucide-react";

function FormDrawer({ open, title, onClose, children }) {
  if (!open) return null;

  return (
    <>
      <div
        className={`
    fixed inset-0
    bg-black/40
    backdrop-blur-sm
    z-60
    transition-opacity
    duration-300
    ${open ? "opacity-100" : "opacity-0 pointer-events-none"}
  `}
        onClick={onClose}
      />
      <div
        className={`
fixed
top-0
right-0
h-full
w-full
md:w-[650px]
bg-white
z-70
shadow-xl
overflow-y-auto
transform
transition-transform
duration-300
ease-in-out
${open ? "translate-x-0" : "translate-x-full"}
`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{title}</h2>

            <button
              onClick={onClose}
              className="
                p-2
                rounded-lg
                hover:bg-gray-100
              "
            >
              <X size={20} />
            </button>
          </div>

          {children}
        </div>
      </div>
    </>
  );
}

export default FormDrawer;
