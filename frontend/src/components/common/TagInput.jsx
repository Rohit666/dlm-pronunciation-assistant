import { X } from "lucide-react";
import { useState } from "react";

function TagInput({ label, value = [], onChange, placeholder }) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const tag = input.trim();

    if (!tag) return;

    if (value.includes(tag)) {
      setInput("");
      return;
    }

    onChange([...value, tag]);

    setInput("");
  };

  const removeTag = (tag) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div>
      <label className="block mb-2 text-sm font-medium">{label}</label>

      <div className="border rounded-xl p-3">
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((tag) => (
            <div
              key={tag}
              className="
                bg-indigo-100
                text-indigo-700
                px-3 py-1
                rounded-full
                flex items-center
                gap-2
              "
            >
              {tag}

              <button type="button" onClick={() => removeTag(tag)}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <input
          value={input}
          placeholder={placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
              e.preventDefault();

              addTag();
            }
          }}
          className="
            w-full
            outline-none
          "
        />
      </div>
    </div>
  );
}

export default TagInput;
