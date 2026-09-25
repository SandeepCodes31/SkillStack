import express from "express";
import isAuthenticated, { authorizeAdmin } from "../middlewares/isAuthenticated.js";
import {
  getMyCertificates,
  getCertificateById,
  verifyCertificate,
  downloadCertificatePdf,
  getAllAdminCertificates,
} from "../controllers/certificate.controller.js";

const router = express.Router();

// Public Verification Endpoint
router.route("/verify/:identifier").get(verifyCertificate);

// Student Protected Endpoints
router.route("/my-certificates").get(isAuthenticated, getMyCertificates);
router.route("/:certificateId").get(isAuthenticated, getCertificateById);
router.route("/:certificateId/pdf").get(isAuthenticated, downloadCertificatePdf);

// Admin Protected Endpoints
router.route("/admin/all").get(isAuthenticated, authorizeAdmin, getAllAdminCertificates);

export default router;
