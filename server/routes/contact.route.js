import express from "express";
import {
  sendContactMessage,
  getAllContactMessages,
} from "../controllers/contact.controller.js";
import isAuthenticated, { authorizeAdmin } from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Public endpoint for submitting inquiries
router.route("/send").post(sendContactMessage);

// Protected admin endpoint for viewing submitted messages
router.route("/all").get(isAuthenticated, authorizeAdmin, getAllContactMessages);

export default router;
