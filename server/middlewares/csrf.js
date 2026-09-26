/**
 * Robust CSRF Protection Middleware for SkillStack LMS
 *
 * Protects state-changing requests (POST, PUT, PATCH, DELETE) against Cross-Site Request Forgery.
 * - Idempotent methods (GET, HEAD, OPTIONS) are exempt.
 * - Stripe webhook (/api/v1/purchase/webhook) uses cryptographic signature verification and is exempt.
 * - Public auth routes (/login, /register) are exempt because session cookies do not yet exist.
 * - Validates Origin/Referer headers against configured allowed domains for cookie-authenticated requests.
 */

const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  "https://skill-stack-project.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean);

export const csrfProtection = (req, res, next) => {
  // 1. Safe HTTP methods do not alter state
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // 2. Stripe webhook operates server-to-server with HMAC signature
  if (
    req.originalUrl?.includes("/purchase/webhook") ||
    req.path?.includes("/purchase/webhook")
  ) {
    return next();
  }

  // 3. Public registration & login endpoints don't have session cookies yet
  if (
    req.path === "/api/v1/user/login" ||
    req.path === "/api/v1/user/register" ||
    req.originalUrl?.includes("/user/login") ||
    req.originalUrl?.includes("/user/register")
  ) {
    return next();
  }

  // 4. If request has Bearer authorization header, it is an explicit client API call
  const hasBearer = req.headers.authorization?.startsWith("Bearer ");
  if (hasBearer && !req.cookies?.token) {
    return next();
  }

  // 5. For browser requests using ambient session cookies, verify request origin
  if (req.cookies?.token) {
    const rawOrigin =
      req.headers["origin"] ||
      (req.headers["referer"] ? new URL(req.headers["referer"]).origin : null);

    if (!rawOrigin) {
      // In non-production, permit tools without origin headers (e.g. Postman, curl, tests)
      if (process.env.NODE_ENV !== "production") {
        return next();
      }
      return res.status(403).json({
        success: false,
        message: "CSRF verification failed: Missing origin header.",
      });
    }

    const isAllowed =
      ALLOWED_ORIGINS.includes(rawOrigin) ||
      rawOrigin.startsWith("http://localhost:") ||
      rawOrigin.startsWith("http://127.0.0.1:") ||
      (rawOrigin.endsWith(".vercel.app") && rawOrigin.includes("skill-stack"));

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: "CSRF verification failed: Untrusted request origin.",
      });
    }
  }

  next();
};

export default csrfProtection;
