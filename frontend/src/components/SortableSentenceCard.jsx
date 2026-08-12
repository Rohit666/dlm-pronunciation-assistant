import { useSortable } from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { API_BASE_URL } from "../constants/api";

function SortableSentenceCard({ sentence, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: sentence.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),

    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-3xl shadow-sm p-6 border"
    >
      <div className="flex items-start gap-4">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 text-gray-400 hover:text-gray-700 cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={22} />
        </button>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-semibold">
                  Order: {sentence.sentence_order}
                </span>
              </div>

              <p className="text-gray-800 leading-7 text-lg">
                {sentence.sentence_text}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onEdit(sentence)}
                className="w-10 h-10 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 cursor-pointer"
              >
                <Pencil size={18} className="text-blue-600" />
              </button>

              <button
                onClick={() => onDelete(sentence)}
                className="w-10 h-10 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 cursor-pointer"
              >
                <Trash2 size={18} className="text-red-600" />
              </button>
            </div>
          </div>

          {/* Media Preview */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {sentence.image_path && (
              <img
                src={`${API_BASE_URL}/${sentence.image_path}`}
                alt="Sentence"
                className="w-full h-48 object-cover rounded-2xl"
              />
            )}

            {sentence.audio_path && (
              <audio key={sentence.audio_path} controls className="w-full">
                <source src={`${API_BASE_URL}/${sentence.audio_path}`} />
              </audio>
            )}

            {sentence.video_path && (
              <video
                key={sentence.video_path}
                controls
                className="w-full rounded-2xl"
              >
                <source src={`${API_BASE_URL}/${sentence.video_path}`} />
              </video>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SortableSentenceCard;
