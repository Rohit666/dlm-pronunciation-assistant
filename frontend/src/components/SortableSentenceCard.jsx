import { useSortable } from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { API_BASE_URL } from "../constants/api";
import { blocksFromSentence } from "../utils/sentenceBlocks";

// Renders one block's text + its own attachments only — never the
// legacy flat sentence_text/audio_path/image_path/video_path, which
// only ever mirror the main_text block and would silently hide
// sub-text blocks and misattribute their media to "the sentence" as a
// whole (the bug this component previously had).
function BlockPreview({ block, index }) {
  const hasAttachments = block.attachments.length > 0;

  return (
    <div className="border border-gray-100 rounded-2xl p-4">
      <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-700 mb-2">
        {block.type === "main_text" ? "Main Text" : `Sub-Text ${index}`}
      </span>

      <p className="text-gray-800 leading-7">{block.text}</p>

      {hasAttachments && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {block.attachments.map((attachment) => {
            if (attachment.type === "image") {
              return (
                <img
                  key={attachment.file_path}
                  src={attachment.previewUrl}
                  alt="Sentence"
                  className="w-full h-40 object-cover rounded-xl"
                />
              );
            }
            if (attachment.type === "audio") {
              return (
                <audio key={attachment.file_path} controls className="w-full">
                  <source src={attachment.previewUrl} />
                </audio>
              );
            }
            if (attachment.type === "video") {
              return (
                <video
                  key={attachment.file_path}
                  controls
                  className="w-full rounded-xl"
                >
                  <source src={attachment.previewUrl} />
                </video>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}

function SortableSentenceCard({ sentence, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: sentence.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),

    transition,
  };

  const blocks = blocksFromSentence(sentence, API_BASE_URL);
  let subTextCounter = 0;

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
          <div className="flex items-start justify-between gap-4 mb-4">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-semibold">
              Order: {sentence.sentence_order}
            </span>

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

          {/* Each block renders sequentially with only its own
              attachments — main text, then every sub-text block in
              order. */}
          <div className="space-y-3">
            {blocks.map((block) => {
              if (block.type === "sub_text") subTextCounter += 1;
              return (
                <BlockPreview
                  key={block.id}
                  block={block}
                  index={subTextCounter}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SortableSentenceCard;
