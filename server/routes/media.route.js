import express from "express";
import fs from "fs";
import upload from "../utils/multer.js";
import { uploadMedia } from "../utils/cloudinary.js";
import isAuthenticated, { authorizeAdmin } from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.route("/upload-video").post(isAuthenticated, authorizeAdmin, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file was uploaded.",
      });
    }

    const result = await uploadMedia(req.file.path);

    // Clean up temporary uploaded file from disk
    try {
      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (cleanupErr) {
      console.warn("Notice: temporary file cleanup notice:", cleanupErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "File uploaded Successfully",
      data: result,
    });
  } catch (error) {
    // Attempt cleanup on failure as well
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (_) {}
    }
    console.error("Media upload error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Error uploading file",
    });
  }
});

export default router;
