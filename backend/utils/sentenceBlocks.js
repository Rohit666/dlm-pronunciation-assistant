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

const sanitizeHtml = require("sanitize-html");

const ATTACHMENT_TYPES = ["audio", "image", "video"];
const BLOCK_TYPES = ["main_text", "sub_text"];

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Server-side sanitize choke point for block.text (now rich HTML from
// the Tiptap editor, not plain text). Allowlist mirrors exactly what
// @tiptap/starter-kit can produce — nothing else gets through. This is
// the authority: the frontend also sanitizes with DOMPurify before it
// ever calls this API, but that's defense in depth, not the guarantee —
// a direct API call bypasses the browser entirely, and this text is
// later rendered via dangerouslySetInnerHTML to OTHER users
// (mentees viewing the sentence), so unsanitized input here is a stored
// XSS vector regardless of what the client already did.
const TEXT_SANITIZE_OPTIONS = {
  allowedTags: [
    "p", "br", "strong", "em", "s", "code",
    "ul", "ol", "li", "blockquote",
    "h1", "h2", "h3", "hr",
  ],
  allowedAttributes: {},
};

function sanitizeBlockText(text) {
  return sanitizeHtml(text, TEXT_SANITIZE_OPTIONS);
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
        text: sanitizeBlockText(typeof block.text === "string" ? block.text : ""),
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
  // Generic rich-text sanitizer, not sentence-specific despite living
  // here — reused by exerciseController.js for exercise_questions.prompt,
  // which is the same "mentor-authored HTML rendered to other users via
  // dangerouslySetInnerHTML" hazard this was built for.
  sanitizeBlockText,
};
