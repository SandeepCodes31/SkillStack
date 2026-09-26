import express from "express";
import isAuthenticated, { authorizeAdmin } from "../middlewares/isAuthenticated.js";
import {
  getMyCertificates,
  getCertificateById,
  verifyCertificate,
  downloadCertificatePdf,
  getAllAdminCertificates,
} from "../controllers/certificate.controller.js";
import {
  generalApiLimiter,
  sensitiveLimiter,
} from "../middlewares/rateLimiter.js";

const router = express.Router();
router.use(generalApiLimiter);

// Public Verification Endpoint
router.route("/verify/:identifier").get(verifyCertificate);

// Student Protected Endpoints
router.route("/my-certificates").get(isAuthenticated, getMyCertificates);
router.route("/:id").get(isAuthenticated, getCertificateById);
router.route("/:id/pdf").get(sensitiveLimiter, isAuthenticated, downloadCertificatePdf);

// Admin Protected Endpoints
router.route("/admin/all").get(isAuthenticated, authorizeAdmin, getAllAdminCertificates);

export default router;
