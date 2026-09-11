const { LessonSentence } = require("../models");
const {
  normalizeContentBlocks,
  deriveLegacyColumns,
} = require("../utils/sentenceBlocks");

exports.getLessonSentences = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const sentences = await LessonSentence.findAll({
      where: {
        lesson_id: lessonId,
      },

      order: [["sentence_order", "ASC"]],
    });

    res.json({
      success: true,
      sentences,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Maps req.files (from upload.any()) back onto the client-submitted
// content_blocks[].attachments[] entries.
//
// Each attachment the frontend sends is one of:
//   { type, upload_field: "block_<i>_attachment_<j>" }  -> a new file,
//     uploaded under that exact multipart fieldname
//   { type, existing_file_path: "uploads/..." }          -> keep a file
//     that was already saved on a previous create/update
//
// Anything else (no matching upload, no existing_file_path) is dropped
// rather than persisted as a broken reference.
function resolveBlockAttachments(rawBlocks, files) {
  const fileByField = new Map();
  for (const file of files || []) {
    fileByField.set(file.fieldname, file);
  }

  return rawBlocks.map((block) => {
    const attachments = Array.isArray(block.attachments) ? block.attachments : [];

    const resolvedAttachments = attachments
      .map((attachment) => {
        if (attachment.upload_field && fileByField.has(attachment.upload_field)) {
          return {
            type: attachment.type,
            file_path: fileByField.get(attachment.upload_field).path,
          };
        }
        if (attachment.existing_file_path) {
          return {
            type: attachment.type,
            file_path: attachment.existing_file_path,
          };
        }
        return null;
      })
      .filter(Boolean);

    return { ...block, attachments: resolvedAttachments };
  });
}

function parseContentBlocksField(rawValue) {
  if (!rawValue) return null;
  try {
    return JSON.parse(rawValue);
  } catch (error) {
    throw new Error("content_blocks must be valid JSON");
  }
}

exports.createSentence = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { sentence_order, topic_id } = req.body;

    const rawBlocks = parseContentBlocksField(req.body.content_blocks);

    if (!rawBlocks) {
      return res.status(400).json({
        success: false,
        message: "content_blocks is required",
      });
    }

    const resolvedBlocks = resolveBlockAttachments(rawBlocks, req.files);
    const contentBlocks = normalizeContentBlocks(resolvedBlocks);
    const legacyColumns = deriveLegacyColumns(contentBlocks);

    const sentence = await LessonSentence.create({
      lesson_id: lessonId,
      // Hierarchical Content Tree — omitted/empty means course root.
      topic_id: topic_id || null,
      sentence_order,
      content_blocks: contentBlocks,
      ...legacyColumns,
    });

    res.status(201).json({
      success: true,
      message: "Sentence created successfully",
      sentence,
    });
  } catch (error) {
    console.error(error);

    res.status(error.message?.includes("content_blocks") ? 400 : 500).json({
      success: false,
      message: error.message?.includes("content_blocks")
        ? error.message
        : "Server error",
    });
  }
};

exports.deleteSentence = async (req, res) => {
  try {
    const { id } = req.params;

    const sentence = await LessonSentence.findByPk(id);

    if (!sentence) {
      return res.status(404).json({
        success: false,
        message: "Sentence not found",
      });
    }

    await sentence.destroy();

    res.json({
      success: true,

      message: "Sentence deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.updateSentence = async (req, res) => {
  try {
    const { id } = req.params;
    const { sentence_order } = req.body;

    const sentence = await LessonSentence.findByPk(id);

    if (!sentence) {
      return res.status(404).json({
        success: false,
        message: "Sentence not found",
      });
    }

    const rawBlocks = parseContentBlocksField(req.body.content_blocks);

    if (!rawBlocks) {
      return res.status(400).json({
        success: false,
        message: "content_blocks is required",
      });
    }

    const resolvedBlocks = resolveBlockAttachments(rawBlocks, req.files);
    const contentBlocks = normalizeContentBlocks(resolvedBlocks);
    const legacyColumns = deriveLegacyColumns(contentBlocks);

    await sentence.update({
      sentence_order,
      content_blocks: contentBlocks,
      ...legacyColumns,
    });

    res.json({
      success: true,
      message: "Sentence updated successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(error.message?.includes("content_blocks") ? 400 : 500).json({
      success: false,
      message: error.message?.includes("content_blocks")
        ? error.message
        : "Server error",
    });
  }
};

exports.reorderSentences = async (req, res) => {
  try {
    const { sentences } = req.body;

    for (const sentence of sentences) {
      await LessonSentence.update(
        {
          sentence_order: sentence.sentence_order,
        },
        {
          where: {
            id: sentence.id,
          },
        },
      );
    }

    res.json({
      success: true,
      message: "Sentence order updated successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
