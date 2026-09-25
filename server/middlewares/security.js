/**
 * Enterprise Security Middleware Suite for SkillStack LMS
 * - Hardened HTTP Security Headers
 * - In-Memory Rate Limiting (Anti-Brute-Force & DOS protection)
 * - Express 5 Compatible NoSQL Injection Guard
 */

// In-memory store for rate limiting (keyed by IP)
const rateLimitStore = new Map();

/**
 * Clean up old rate limit entries every 10 minutes to prevent memory leaks
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

/**
 * Configurable Rate Limiter Middleware
 * Automatically bypassed in development mode to prevent local test lockouts.
 */
export const rateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = "Too many requests from this IP, please try again later.",
} = {}) => {
  return (req, res, next) => {
    // In local development, bypass rate limiting
    if (process.env.NODE_ENV !== "production") {
      return next();
    }

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "unknown-ip";

    const key = `${ip}:${req.baseUrl || req.path}`;
    const now = Date.now();

    let record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, record);
    } else {
      record.count += 1;
    }

    // Set standard rate limit headers
    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - record.count));
    res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      return res.status(429).json({
        success: false,
        message,
        retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
      });
    }

    next();
  };
};

/**
 * Stricter Rate Limiter for Authentication (Brute-force protection)
 */
export const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many authentication attempts. Please wait 15 minutes before trying again.",
});

/**
 * General Security Headers Middleware
 */
export const securityHeaders = (req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent Clickjacking attacks (cannot be embedded in iframes)
  res.setHeader("X-Frame-Options", "DENY");

  // XSS Protection Filter
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Control referrer information
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Enforce HSTS (Strict-Transport-Security) for HTTPS in production
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  // Remove fingerprinting header
  res.removeHeader("X-Powered-By");

  next();
};

/**
 * In-place NoSQL Injection Sanitizer
 * Mutates objects in place to remain fully compatible with Express 5 getters
 */
export const sanitizeInPlace = (obj) => {
  if (!obj || typeof obj !== "object") return;

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === "object" && obj[i] !== null) {
        sanitizeInPlace(obj[i]);
      }
    }
    return;
  }

  for (const key of Object.keys(obj)) {
    // Strip keys starting with '$' or containing '.'
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      sanitizeInPlace(obj[key]);
    }
  }
};

export const noSqlInjectionGuard = (req, res, next) => {
  try {
    if (req.body && typeof req.body === "object") {
      sanitizeInPlace(req.body);
    }
    if (req.query && typeof req.query === "object") {
      sanitizeInPlace(req.query);
    }
    if (req.params && typeof req.params === "object") {
      sanitizeInPlace(req.params);
    }
  } catch (err) {
    console.error("Sanitization warning:", err);
  }
  next();
};
