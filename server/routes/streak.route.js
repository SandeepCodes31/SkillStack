import express from "express";
import isAuthenticated, { authorizeAdmin } from "../middlewares/isAuthenticated.js";
import {
  getMyStreak,
  getMyBadges,
  getMyActivity,
  getMyStats,
  getAdminAnalytics,
} from "../controllers/streak.controller.js";

const router = express.Router();

// Student Streak & Badge Endpoints
router.route("/my").get(isAuthenticated, getMyStreak);
router.route("/badges").get(isAuthenticated, getMyBadges);
router.route("/activity").get(isAuthenticated, getMyActivity);
router.route("/stats").get(isAuthenticated, getMyStats);

// Admin Analytics Endpoint
router.route("/admin/analytics").get(isAuthenticated, authorizeAdmin, getAdminAnalytics);

export default router;
