import rateLimit from "express-rate-limit";

/**
 * Enterprise Rate Limiting Suite for SkillStack LMS
 * Built using express-rate-limit for robust protection against DoS and brute-force attacks.
 */

// 1. General API Limiter (applied across all standard API endpoints)
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 500, // max 500 requests per 15 minutes per IP
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests to SkillStack API. Please try again shortly.",
  },
  skip: (req) => {
    // Never rate limit Stripe webhook
    return req.originalUrl?.includes("/purchase/webhook");
  },
});

// 2. Strict Authentication Limiter (login, register brute-force defense)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // max 20 login/register attempts per 15 minutes per IP
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please wait 15 minutes before trying again.",
  },
});

// 3. Sensitive Operations Limiter (course purchase, checkout, certificate actions)
export const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many sensitive operations requested. Please try again shortly.",
  },
});

// 4. Media Upload Limiter (video and thumbnail file uploads)
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Upload rate limit reached. Please wait a few minutes before uploading more media.",
  },
});

// 5. Contact Form Limiter (anti-spam protection)
export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many contact messages submitted. Please try again in 15 minutes.",
  },
});
