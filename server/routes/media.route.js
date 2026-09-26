import express from "express";
import fs from "fs";
import path from "path";
import upload from "../utils/multer.js";
import { uploadMedia } from "../utils/cloudinary.js";
import isAuthenticated, { authorizeAdmin } from "../middlewares/isAuthenticated.js";
import { authRateLimiter } from "../middlewares/security.js";

const router = express.Router();

// Safe helper to delete uploaded file within the designated uploads folder
const safeUnlink = (rawFilePath) => {
  if (!rawFilePath || typeof rawFilePath !== "string") return;
  try {
    const safeFilename = path.basename(rawFilePath);
    const uploadsDir = path.resolve("uploads");
    const fullSafePath = path.resolve(uploadsDir, safeFilename);

    // Path traversal guard: ensure target is strictly inside uploads folder
    if (fullSafePath.startsWith(uploadsDir) && fs.existsSync(fullSafePath)) {
      fs.unlinkSync(fullSafePath);
    }
  } catch (err) {
    console.warn("Notice: temporary file cleanup notice:", err.message);
  }
};

router.route("/upload-video").post(authRateLimiter, isAuthenticated, authorizeAdmin, upload.single("file"), async (req, res) => {
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
    // Attempt cleanup on failure as well
    if (req.file?.path) {
      safeUnlink(req.file.path);
    }
    console.error("Media upload error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Error uploading file",
    });
  }
});

export default router;
