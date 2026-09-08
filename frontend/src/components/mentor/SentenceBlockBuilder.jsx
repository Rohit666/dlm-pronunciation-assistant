import { ArrowUp, ArrowDown, Trash2, Mic, Image as ImageIcon, Video, Plus } from "lucide-react";
import { createEmptyBlock } from "../../utils/sentenceBlocks";
import RichTextEditor from "./RichTextEditor";

const ATTACHMENT_CONFIG = [
  { type: "audio", label: "Audio", accept: "audio/*", icon: Mic },
  { type: "image", label: "Image / GIF", accept: "image/*,.gif", icon: ImageIcon },
  { type: "video", label: "Video", accept: "video/*", icon: Video },
];

function AttachmentSlot({ type, label, accept, icon: Icon, attachment, onAttach, onRemove }) {
  return (
    <div className="border border-dashed border-gray-200 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
          <Icon size={14} />
          {label}
        </span>
        {attachment && (
          <button
            type="button"
            onClick={() => onRemove(type)}
            className="text-xs text-red-600 hover:text-red-700 cursor-pointer"
          >
            Remove
          </button>
        )}
      </div>

      {attachment ? (
        <div>
          {type === "audio" && (
            <audio controls className="w-full h-9">
              <source src={attachment.previewUrl} />
            </audio>
          )}
          {type === "image" && (
            <img src={attachment.previewUrl} alt="" className="w-full h-24 object-cover rounded-lg" />
          )}
          {type === "video" && (
            <video controls className="w-full rounded-lg max-h-32">
              <source src={attachment.previewUrl} />
            </video>
          )}
        </div>
      ) : (
        <input
          type="file"
          accept={accept}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onAttach(type, file);
          }}
          className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
        />
      )}
    </div>
  );
}

function BlockCard({ block, index, isFirst, isLast, canRemove, canReorder, onChange, onRemove, onMove }) {
  const attachmentByType = (type) => block.attachments.find((a) => a.type === type) || null;

  const handleAttach = (type, file) => {
    const previewUrl = URL.createObjectURL(file);
    const nextAttachments = block.attachments.filter((a) => a.type !== type);
    nextAttachments.push({ type, file, file_path: null, previewUrl });
    onChange({ ...block, attachments: nextAttachments });
  };

  const handleRemoveAttachment = (type) => {
    onChange({ ...block, attachments: block.attachments.filter((a) => a.type !== type) });
  };

  return (
    <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/60">
      <div className="flex items-center justify-between mb-3">
        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-700">
          {block.type === "main_text" ? "Main Text" : `Sub-Text ${index}`}
        </span>

        <div className="flex items-center gap-2">
          {canReorder && (
            <>
              <button
                type="button"
                disabled={isFirst}
                onClick={() => onMove(-1)}
                className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Move block up"
              >
                <ArrowUp size={14} />
              </button>
              <button
                type="button"
                disabled={isLast}
                onClick={() => onMove(1)}
                className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Move block down"
              >
                <ArrowDown size={14} />
              </button>
            </>
          )}
          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center cursor-pointer"
              aria-label="Remove block"
            >
              <Trash2 size={14} className="text-red-600" />
            </button>
          )}
        </div>
      </div>

      <div className="mb-3">
        <RichTextEditor
          value={block.text}
          onChange={(html) => onChange({ ...block, text: html })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {ATTACHMENT_CONFIG.map((config) => (
          <AttachmentSlot
            key={config.type}
            {...config}
            attachment={attachmentByType(config.type)}
            onAttach={handleAttach}
            onRemove={handleRemoveAttachment}
          />
        ))}
      </div>
    </div>
  );
}

// Modular, reorderable block-based content builder for a lesson
// sentence (SRS "Dynamic Multi-Text & Modular Attachment Content
// Builder"): Main Text + attachments, plus any number of Sub-Text
// blocks + attachments, add/remove/reorder via Move Up/Down.
//
// Controlled component: `blocks` / `onBlocksChange` own the state so
// the parent page can wire it into either the "Add Sentence" panel or
// the "Edit Sentence" modal.
function SentenceBlockBuilder({ blocks, onBlocksChange }) {
  const subTextCount = blocks.filter((b) => b.type === "sub_text").length;

  const updateBlockAt = (index, nextBlock) => {
    const next = blocks.slice();
    next[index] = nextBlock;
    onBlocksChange(next);
  };

  const removeBlockAt = (index) => {
    onBlocksChange(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    // main_text is always pinned at index 0 — only sub_text blocks
    // among themselves are reorderable.
    if (blocks[targetIndex].type === "main_text") return;

    const next = blocks.slice();
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    onBlocksChange(next);
  };

  const addSubText = () => {
    onBlocksChange([...blocks, createEmptyBlock("sub_text", blocks.length + 1)]);
  };

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => (
        <BlockCard
          key={block.id}
          block={block}
          index={blocks.slice(0, index).filter((b) => b.type === "sub_text").length + 1}
          isFirst={index <= 1}
          isLast={index === blocks.length - 1}
          canRemove={block.type === "sub_text"}
          canReorder={block.type === "sub_text"}
          onChange={(next) => updateBlockAt(index, next)}
          onRemove={() => removeBlockAt(index)}
          onMove={(direction) => moveBlock(index, direction)}
        />
      ))}

      <button
        type="button"
        onClick={addSubText}
        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50 py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer"
      >
        <Plus size={16} />
        Add Sub-Text{subTextCount > 0 ? ` (${subTextCount})` : ""}
      </button>
    </div>
  );
}

export default SentenceBlockBuilder;
