const multer = require("multer");

const path = require("path");

// Dynamic block attachments (Part 1 content builder) use fieldnames
// like "block_0_attachment_0" — index count is unbounded, so unlike
// the fixed fields below, destination is routed by MIME type.
const BLOCK_ATTACHMENT_FIELD = /^block_\d+_attachment_\d+$/;

function destinationForMimeType(mimetype) {
  if (mimetype.startsWith("audio/")) return "uploads/audio";
  if (mimetype.startsWith("image/")) return "uploads/images";
  if (mimetype.startsWith("video/")) return "uploads/videos";
  return "uploads";
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "thumbnail") {
      cb(null, "uploads/thumbnails");
    } else if (file.fieldname === "audio") {
      cb(null, "uploads/audio");
    } else if (file.fieldname === "sentence_audio") {
      cb(null, "uploads/audio");
    } else if (file.fieldname === "sentence_image") {
      cb(null, "uploads/images");
    } else if (file.fieldname === "sentence_video") {
      cb(null, "uploads/videos");
    } else if (file.fieldname === "recording") {
      cb(null, "uploads/recordings");
    } else if (BLOCK_ATTACHMENT_FIELD.test(file.fieldname)) {
      cb(null, destinationForMimeType(file.mimetype));
    } else {
      cb(null, "uploads");
    }
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
});

module.exports = upload;
