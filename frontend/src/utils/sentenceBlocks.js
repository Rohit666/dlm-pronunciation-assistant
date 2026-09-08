// Mirrors backend/utils/sentenceBlocks.js's content_blocks shape on the
// client, plus the FormData wiring the dynamic block builder needs.
//
// Block (client-side, before submit):
//   {
//     id: "block-<n>",
//     type: "main_text" | "sub_text",
//     text: "...",
//     order: 1,
//     attachments: [
//       { type: "audio"|"image"|"video", file: File|null, file_path: string|null, previewUrl: string|null }
//     ],
//   }
//
// Each block keeps at most one attachment per type (mirrors the
// original static form's one-audio/one-image/one-video-per-sentence
// limit, now available per block instead of only on the sentence).

let blockIdCounter = 0;
function nextBlockId() {
  blockIdCounter += 1;
  return `block-new-${Date.now()}-${blockIdCounter}`;
}

export function createEmptyBlock(type, order) {
  return {
    id: nextBlockId(),
    type,
    text: "",
    order,
    attachments: [],
  };
}

// Sequelize's JSON type normally hands back a parsed array, but a
// stringified value can surface (e.g. a raw SQL read outside the ORM) —
// tolerate it defensively rather than silently falling back to the
// legacy single-block view and looking like sub-text got dropped.
function parseContentBlocks(rawContentBlocks) {
  if (Array.isArray(rawContentBlocks)) return rawContentBlocks;
  if (typeof rawContentBlocks === "string") {
    try {
      const parsed = JSON.parse(rawContentBlocks);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
  return null;
}

// Builds the in-memory block list from a saved LessonSentence. Prefers
// content_blocks (Part 1); falls back to the legacy flat columns for
// any row the migration backfill somehow missed.
export function blocksFromSentence(sentence, apiBaseUrl) {
  const contentBlocks = parseContentBlocks(sentence?.content_blocks);

  if (contentBlocks && contentBlocks.length) {
    return contentBlocks
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((block) => ({
        id: block.id,
        type: block.type,
        text: block.text || "",
        order: block.order,
        attachments: (block.attachments || []).map((attachment) => ({
          type: attachment.type,
          file: null,
          file_path: attachment.file_path,
          previewUrl: `${apiBaseUrl}/${attachment.file_path}`,
        })),
      }));
  }

  const attachments = [];
  if (sentence?.audio_path) {
    attachments.push({
      type: "audio",
      file: null,
      file_path: sentence.audio_path,
      previewUrl: `${apiBaseUrl}/${sentence.audio_path}`,
    });
  }
  if (sentence?.image_path) {
    attachments.push({
      type: "image",
      file: null,
      file_path: sentence.image_path,
      previewUrl: `${apiBaseUrl}/${sentence.image_path}`,
    });
  }
  if (sentence?.video_path) {
    attachments.push({
      type: "video",
      file: null,
      file_path: sentence.video_path,
      previewUrl: `${apiBaseUrl}/${sentence.video_path}`,
    });
  }

  return [
    {
      id: "block-legacy-main",
      type: "main_text",
      text: sentence?.sentence_text || "",
      order: 1,
      attachments,
    },
  ];
}

export function defaultBlocks() {
  return [createEmptyBlock("main_text", 1)];
}

// Serializes blocks into a submittable content_blocks payload +
// appends the actual File objects to formData under indexed
// fieldnames the backend's dynamic upload middleware understands
// (block_<blockIndex>_attachment_<attachmentIndex>).
export function appendBlocksToFormData(formData, blocks) {
  const payload = blocks.map((block, blockIndex) => ({
    id: block.id,
    type: block.type,
    text: block.text,
    order: blockIndex + 1,
    attachments: block.attachments
      .filter((attachment) => attachment.file || attachment.file_path)
      .map((attachment, attachmentIndex) => {
        if (attachment.file) {
          const fieldName = `block_${blockIndex}_attachment_${attachmentIndex}`;
          formData.append(fieldName, attachment.file);
          return { type: attachment.type, upload_field: fieldName };
        }
        return { type: attachment.type, existing_file_path: attachment.file_path };
      }),
  }));

  formData.append("content_blocks", JSON.stringify(payload));
}
