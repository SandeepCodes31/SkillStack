import { Certificate } from "../models/certificate.model.js";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";
import { buildCertificatePdf } from "../utils/certificatePdf.js";

/**
 * GET /api/v1/certificate/my-certificates
 * Lists all certificates earned by the authenticated student.
 */
export const getMyCertificates = async (req, res) => {
  try {
    const studentId = req.id;

    const certificates = await Certificate.find({ studentId })
      .populate("courseId", "courseTitle courseThumbnail category")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      certificates,
    });
  } catch (error) {
    console.error("getMyCertificates error:", error);
    return res.status(500).json({ success: false, message: "Failed to load certificates." });
  }
};

/**
 * GET /api/v1/certificate/:certificateId
 * Retrieves certificate metadata.
 * Security: Accessible only by certificate owner or admin.
 */
export const getCertificateById = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const userId = req.id;
    const userRole = req.role;

    const certificate = await Certificate.findOne({ certificateId })
      .populate("courseId", "courseTitle category creator");

    if (!certificate) {
      return res.status(404).json({ success: false, message: "Certificate not found." });
    }

    const isOwner = certificate.studentId.toString() === userId.toString();
    const isAdmin = userRole === "admin" || userRole === "instructor";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied to this certificate." });
    }

    return res.status(200).json({
      success: true,
      certificate,
    });
  } catch (error) {
    console.error("getCertificateById error:", error);
    return res.status(500).json({ success: false, message: "Failed to load certificate." });
  }
};

/**
 * GET /api/v1/certificate/verify/:identifier
 * Public verification endpoint by Certificate ID (e.g. SKILL-2026-XXXX) or Verification Code (VCD-XXXX).
 */
export const verifyCertificate = async (req, res) => {
  try {
    const { identifier } = req.params;
    const cleanId = String(identifier).trim();

    const certificate = await Certificate.findOne({
      $or: [
        { certificateId: cleanId },
        { verificationCode: cleanId },
      ],
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: "No authentic certificate found matching this credential identifier.",
      });
    }

    return res.status(200).json({
      success: true,
      valid: true,
      message: "Official SkillStack Verified Credential",
      certificate: {
        certificateId: certificate.certificateId,
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        instructorName: certificate.instructorName,
        finalScore: certificate.finalScore,
        issueDate: certificate.issueDate,
        completionDate: certificate.completionDate,
        verificationCode: certificate.verificationCode,
      },
    });
  } catch (error) {
    console.error("verifyCertificate error:", error);
    return res.status(500).json({ success: false, message: "Verification lookup failed." });
  }
};

/**
 * GET /api/v1/certificate/:certificateId/pdf
 * Streams high-resolution PDF certificate with embedded QR verification code.
 */
export const downloadCertificatePdf = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const userId = req.id;
    const userRole = req.role;

    const certificate = await Certificate.findOne({ certificateId });
    if (!certificate) {
      return res.status(404).json({ success: false, message: "Certificate not found." });
    }

    const isOwner = certificate.studentId.toString() === userId.toString();
    const isAdmin = userRole === "admin" || userRole === "instructor";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    await buildCertificatePdf(certificate, res);
  } catch (error) {
    console.error("downloadCertificatePdf error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: "Failed to generate certificate PDF." });
    }
  }
};

/**
 * GET /api/v1/certificate/admin/all
 * Lists all issued certificates across the LMS for administrators.
 */
export const getAllAdminCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate("studentId", "name email")
      .populate("courseId", "courseTitle")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      certificates,
    });
  } catch (error) {
    console.error("getAllAdminCertificates error:", error);
    return res.status(500).json({ success: false, message: "Failed to load admin certificates." });
  }
};
