// Shared shape helpers for LessonSentence.content_blocks.
//
// content_blocks: [
//   {
//     id: "block-<n>",
//     type: "main_text" | "sub_text",
//     text: "...",
//     order: 1,
//     attachments: [{ type: "audio"|"image"|"video", file_path: "uploads/..." }],
//   },
//   ...
// ]

const ATTACHMENT_TYPES = ["audio", "image", "video"];
const BLOCK_TYPES = ["main_text", "sub_text"];

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Validates + normalizes a client-submitted content_blocks payload
// (attachments already resolved to file_path strings — see
// lessonSentenceController.resolveBlockAttachments). Throws on
// malformed input instead of silently persisting garbage.
function normalizeContentBlocks(rawBlocks) {
  if (!Array.isArray(rawBlocks)) {
    throw new Error("content_blocks must be an array");
  }

  const hasMainText = rawBlocks.some((block) => block?.type === "main_text");
  if (!hasMainText) {
    throw new Error("content_blocks must include exactly one main_text block");
  }

  return rawBlocks
    .map((block, index) => {
      if (!isPlainObject(block)) {
        throw new Error(`content_blocks[${index}] must be an object`);
      }
      if (!BLOCK_TYPES.includes(block.type)) {
        throw new Error(
          `content_blocks[${index}].type must be one of ${BLOCK_TYPES.join(", ")}`,
        );
      }

      const attachments = Array.isArray(block.attachments)
        ? block.attachments
            .filter((attachment) => isPlainObject(attachment) && attachment.file_path)
            .map((attachment) => {
              if (!ATTACHMENT_TYPES.includes(attachment.type)) {
                throw new Error(
                  `content_blocks[${index}].attachments[].type must be one of ${ATTACHMENT_TYPES.join(", ")}`,
                );
              }
              return {
                type: attachment.type,
                file_path: String(attachment.file_path),
              };
            })
        : [];

      return {
        id: block.id ? String(block.id) : `block-${index}`,
        type: block.type,
        text: typeof block.text === "string" ? block.text : "",
        order: Number.isFinite(block.order) ? block.order : index + 1,
        attachments,
      };
    })
    .sort((a, b) => a.order - b.order);
}

// Derives the legacy flat columns from a normalized content_blocks
// array, so anything still reading sentence_text/audio_path/image_path
// /video_path directly (practiceController.compare, older reports) keeps
// seeing correct data without being rewritten.
function deriveLegacyColumns(blocks) {
  const mainBlock = blocks.find((block) => block.type === "main_text");
  const firstOfType = (type) => {
    for (const block of blocks) {
      const match = block.attachments.find((attachment) => attachment.type === type);
      if (match) return match.file_path;
    }
    return null;
  };

  return {
    sentence_text: mainBlock ? mainBlock.text : "",
    audio_path: firstOfType("audio"),
    image_path: firstOfType("image"),
    video_path: firstOfType("video"),
  };
}

module.exports = {
  ATTACHMENT_TYPES,
  BLOCK_TYPES,
  normalizeContentBlocks,
  deriveLegacyColumns,
};
