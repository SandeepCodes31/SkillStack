import express from "express";
import isAuthenticated, { authorizeAdmin } from "../middlewares/isAuthenticated.js";
import {
  getCourseQuiz,
  startQuiz,
  submitQuiz,
  getAttemptResult,
  getMyAttempts,
  getAllAdminQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getQuizAnalytics,
} from "../controllers/quiz.controller.js";
import {
  generalApiLimiter,
  sensitiveLimiter,
} from "../middlewares/rateLimiter.js";

const router = express.Router();
router.use(generalApiLimiter);

// Student Endpoints
router.route("/course/:courseId").get(isAuthenticated, getCourseQuiz);
router.route("/:quizId/start").post(isAuthenticated, startQuiz);
router.route("/:quizId/submit").post(isAuthenticated, submitQuiz);
router.route("/attempt/:attemptId").get(isAuthenticated, getAttemptResult);
router.route("/my-attempts/:courseId").get(isAuthenticated, getMyAttempts);

// Admin / Instructor Endpoints
router.route("/admin/all").get(isAuthenticated, authorizeAdmin, getAllAdminQuizzes);
router.route("/admin/analytics/:quizId").get(isAuthenticated, authorizeAdmin, getQuizAnalytics);
router.route("/admin").post(isAuthenticated, authorizeAdmin, createQuiz);
router.route("/admin/:quizId").put(isAuthenticated, authorizeAdmin, updateQuiz).delete(isAuthenticated, authorizeAdmin, deleteQuiz);
router.route("/admin/:quizId/question").post(isAuthenticated, authorizeAdmin, addQuestion);
router.route("/admin/:quizId/question/:questionId").put(isAuthenticated, authorizeAdmin, updateQuestion).delete(isAuthenticated, authorizeAdmin, deleteQuestion);

export default router;
