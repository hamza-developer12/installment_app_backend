const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

// Specify file format...........
function fileFilter(req, file, cb) {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Something went wrong"), false);
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

module.exports = { upload };
