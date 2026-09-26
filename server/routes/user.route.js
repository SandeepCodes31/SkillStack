import express from "express";
import {
  register,
  login,
  getUserProfile,
  logout,
  updateProfile,
} from "../controllers/user.controllers.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/multer.js";
import {
  generalApiLimiter,
  authLimiter,
  sensitiveLimiter,
} from "../middlewares/rateLimiter.js";

const router = express.Router();

router.use(generalApiLimiter);

router.route("/register").post(authLimiter, register);
router.route("/login").post(authLimiter, login);
router.route("/logout").get(logout);
router.route("/profile").get(isAuthenticated, getUserProfile);
router
  .route("/profile/update")
  .put(sensitiveLimiter, isAuthenticated, upload.single("profilePhoto"), updateProfile);

export default router;
