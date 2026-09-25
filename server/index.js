import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";
import quizRoute from "./routes/quiz.route.js";
import certificateRoute from "./routes/certificate.route.js";
import streakRoute from "./routes/streak.route.js";
import { stripeWebhook } from "./controllers/coursePurchase.controller.js";
import {
  securityHeaders,
  noSqlInjectionGuard,
  authRateLimiter,
  rateLimiter,
} from "./middlewares/security.js";

dotenv.config({});

// Database connection
connectDB();

const App = express();
const PORT = process.env.PORT || 8080;

// 1. Security HTTP Headers (HSTS, NoSniff, FrameGuard, XSS)
App.use(securityHeaders);

// 2. Stripe webhook requires the raw Buffer to verify HMAC signature - MUST be mounted before express.json()
App.post(
  "/api/v1/purchase/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// 3. Body parsers with payload size limits to protect against memory exhaustion attacks
App.use(express.json({ limit: "10mb" }));
App.use(express.urlencoded({ extended: true, limit: "10mb" }));
App.use(cookieParser());

// 4. NoSQL Injection protection
App.use(noSqlInjectionGuard);

// 5. Environment-controlled CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean);

App.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server) or matched origins
      if (!origin) return callback(null, true);
      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:");
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);

// 6. Rate Limiting protection against DDoS and Brute Force attacks
const generalApiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: "Too many requests to SkillStack API. Please try again shortly.",
});
App.use("/api/v1", generalApiLimiter);

// Strict rate limit on sensitive authentication routes
App.use("/api/v1/user/login", authRateLimiter);
App.use("/api/v1/user/register", authRateLimiter);

// 7. API Routes
App.use("/api/v1/media", mediaRoute);
App.use("/api/v1/user", userRoute);
App.use("/api/v1/course", courseRoute);
App.use("/api/v1/purchase", purchaseRoute);
App.use("/api/v1/progress", courseProgressRoute);
App.use("/api/v1/quiz", quizRoute);
App.use("/api/v1/certificate", certificateRoute);
App.use("/api/v1/streak", streakRoute);

// Root health check endpoint
App.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

App.listen(PORT, () => {
  console.log(`Server is running securely on port ${PORT}`);
});
