const multer = require("multer");

const path = require("path");

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
