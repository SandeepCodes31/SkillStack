import express from "express";
import fs from "fs";
import path from "path";
import os from "os";
import upload from "../utils/multer.js";
import { uploadMedia } from "../utils/cloudinary.js";
import isAuthenticated, { authorizeAdmin } from "../middlewares/isAuthenticated.js";
import { uploadLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();
router.use(uploadLimiter);

// Safe helper to delete uploaded file within the designated uploads folder or temp upload directory
const safeUnlink = (rawFilePath) => {
  if (!rawFilePath || typeof rawFilePath !== "string") return;
  try {
    const safeFilename = path.basename(rawFilePath);
    const validDirs = [
      path.resolve("uploads"),
      path.resolve(os.tmpdir(), "skillstack_uploads"),
    ];

    for (const dir of validDirs) {
      const fullSafePath = path.resolve(dir, safeFilename);
      if (fullSafePath.startsWith(dir) && fs.existsSync(fullSafePath)) {
        fs.unlinkSync(fullSafePath);
        return;
      }
    }
  } catch (err) {
    console.warn("Notice: temporary file cleanup notice:", err.message);
  }
};

router.route("/upload-video").post(uploadLimiter, isAuthenticated, authorizeAdmin, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file was uploaded.",
      });
    }

    const result = await uploadMedia(req.file.path);

    // Clean up temporary uploaded file from disk safely
    safeUnlink(req.file.path);

    return res.status(200).json({
      success: true,
      message: "File uploaded Successfully",
      data: result,
    });
  } catch (error) {
    // Attempt cleanup even on failure
    if (req.file?.path) {
      safeUnlink(req.file.path);
    }
    console.error("Video upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Error uploading file",
    });
  }
});

export default router;
