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
import contactRoute from "./routes/contact.route.js";
import { stripeWebhook } from "./controllers/coursePurchase.controller.js";
import {
  securityHeaders,
  noSqlInjectionGuard,
} from "./middlewares/security.js";
import {
  generalApiLimiter,
  authLimiter,
  webhookLimiter,
} from "./middlewares/rateLimiter.js";
import csrfProtection from "./middlewares/csrf.js";

dotenv.config({});

// Database connection
connectDB().catch((err) => console.warn("MongoDB initial connection notice:", err.message));

const App = express();
const PORT = process.env.PORT || 8080;

// Trust reverse proxy (Vercel, AWS ALB, Render) for accurate client IP in rate limiting
App.set("trust proxy", 1);

// 1. Security HTTP Headers (HSTS, NoSniff, FrameGuard, XSS)
App.use(securityHeaders);

// 2. Environment-controlled CORS configuration (mounted early so preflights & error responses carry CORS headers)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://skill-stack-project.vercel.app",
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
        origin.startsWith("http://127.0.0.1:") ||
        (origin.endsWith(".vercel.app") && origin.includes("skill-stack"));
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-CSRF-Token",
      "X-XSRF-Token",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Set-Cookie"],
  })
);

// 3. Stripe webhook requires the raw Buffer to verify HMAC signature - MUST be mounted before express.json()
App.post(
  "/api/v1/purchase/webhook",
  webhookLimiter,
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// 4. Body parsers with payload size limits to protect against memory exhaustion attacks
App.use(express.json({ limit: "10mb" }));
App.use(express.urlencoded({ extended: true, limit: "10mb" }));
App.use(cookieParser());

// 5. Cross-Site Request Forgery (CSRF) Protection
App.use(csrfProtection);

// 6. NoSQL Injection protection
App.use(noSqlInjectionGuard);

// 7. Rate Limiting protection against DDoS and Brute Force attacks
App.use("/api/v1", generalApiLimiter);

// 7. Database Readiness Middleware (Ensures MongoDB is connected before handling API queries)
App.use("/api/v1", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection error in request lifecycle:", err);
    return res.status(503).json({
      success: false,
      message: "Database connection temporarily unavailable. Please try again shortly.",
    });
  }
});

// 8. API Routes
App.use("/api/v1/media", mediaRoute);
App.use("/api/v1/user", userRoute);
App.use("/api/v1/course", courseRoute);
App.use("/api/v1/purchase", purchaseRoute);
App.use("/api/v1/progress", courseProgressRoute);
App.use("/api/v1/quiz", quizRoute);
App.use("/api/v1/certificate", certificateRoute);
App.use("/api/v1/streak", streakRoute);
App.use("/api/v1/contact", contactRoute);

// Root & API health check endpoints
const healthHandler = (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
};
App.get("/health", healthHandler);
App.get("/api/health", healthHandler);
App.get("/api/v1/health", healthHandler);

// 9. Global Error Handling Middleware
App.use((err, req, res, next) => {
  console.error("Unhandled Error in API Lifecycle:", err);
  if (res.headersSent) {
    return next(err);
  }
  const isProduction = process.env.NODE_ENV === "production";
  return res.status(err.status || 500).json({
    success: false,
    message: isProduction
      ? "Internal server error occurred"
      : err.message || "Internal server error occurred",
  });
});

// Export App for serverless deployment (Vercel) and listen in local development
if (
  process.env.NODE_ENV !== "test" &&
  !process.env.VERCEL &&
  !process.env.AWS_LAMBDA_FUNCTION_NAME
) {
  App.listen(PORT, () => {
    console.log(`Server is running securely on port ${PORT}`);
  });
}

export default App;

