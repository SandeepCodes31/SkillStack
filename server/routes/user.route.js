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

const router = express.Router();
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile").get(isAuthenticated, getUserProfile);
// router.route("/profile/update").put(isAuthenticated, upload.fields([{ name: 'name' }, { name: 'profilePhoto' }]), updateProfile);
router
  .route("/profile/update")
  .put(isAuthenticated, upload.single("profilePhoto"), updateProfile);

export default router;
