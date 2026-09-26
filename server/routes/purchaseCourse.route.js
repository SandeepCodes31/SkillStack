import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  createCheckoutSession,
  getAllPurchasedCourse,
  getAllPurchases,
  getCourseDetailWithPurchaseStatus,
  getMyPurchases,
  getReceiptData,
  downloadReceiptPdf,
  stripeWebhook,
  verifyCheckoutSession,
} from "../controllers/coursePurchase.controller.js";
import {
  generalApiLimiter,
  sensitiveLimiter,
} from "../middlewares/rateLimiter.js";

const router = express.Router();
router.use(generalApiLimiter);

router.route("/checkout/create-checkout-session").post(sensitiveLimiter, isAuthenticated, createCheckoutSession);
router.route("/webhook").post(express.raw({ type: "application/json" }), stripeWebhook);
router.route("/verify-session/:sessionId").get(verifyCheckoutSession);
router.route("/course/:courseId/detail-with-status").get(isAuthenticated, getCourseDetailWithPurchaseStatus);
router.route("/my-purchases").get(isAuthenticated, getMyPurchases);
router.route("/all-purchases").get(isAuthenticated, getAllPurchases);
router.route("/receipt/:purchaseId").get(getReceiptData);
router.route("/receipt/:purchaseId/pdf").get(downloadReceiptPdf);
router.route("/").get(isAuthenticated, getAllPurchasedCourse);

export default router;
