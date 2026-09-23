const express = require("express");
const multer = require("multer");
const path = require("path");

const protect = require("../middleware/authMiddleware");

const {
  getTemplates,
  createSubmission,
  getMySubmissions,
} = require("../controllers/submissionController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.get("/templates", protect, getTemplates);

router.post(
  "/create",
  protect,
  upload.array("documents", 10),
  createSubmission
);

router.get("/my", protect, getMySubmissions);

module.exports = router;