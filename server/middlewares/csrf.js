import crypto from "crypto";

/**
 * Robust CSRF Protection Middleware for SkillStack LMS
 *
 * Implements defense-in-depth Cross-Site Request Forgery mitigation:
 * 1. Generates and sets secure CSRF token cookies ('XSRF-TOKEN' and 'csrfToken').
 * 2. Idempotent safe methods (GET, HEAD, OPTIONS) are exempt from token verification.
 * 3. Stripe webhooks (/api/v1/purchase/webhook) use cryptographic HMAC signatures and are exempt.
 * 4. Public auth routes (/login, /register) are exempt because session cookies do not yet exist.
 * 5. Explicit API calls with Bearer authorization and without session cookies are exempt.
 * 6. Validates Origin/Referer headers against configured allowed domains for cookie-authenticated requests.
 * 7. Validates CSRF tokens using timing-safe comparison when client sends headers.
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
  const isProduction = process.env.NODE_ENV === "production";

  // Ensure CSRF token cookie is set for client consumption
  const existingCookieToken = req.cookies?.csrfToken || req.cookies?.["XSRF-TOKEN"];
  if (!existingCookieToken) {
    const newCsrfToken = crypto.randomBytes(32).toString("hex");
    res.cookie("XSRF-TOKEN", newCsrfToken, {
      httpOnly: false, // Accessible by frontend scripts to read and forward in headers
      sameSite: "lax",
      secure: isProduction,
      path: "/",
    });
    res.cookie("csrfToken", newCsrfToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      path: "/",
    });
    res.locals.csrfToken = newCsrfToken;
  } else {
    res.locals.csrfToken = existingCookieToken;
  }

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

  // 4. Explicit client API calls with Bearer authorization cannot be forged via CSRF
  const hasBearer = req.headers.authorization?.startsWith("Bearer ");
  if (hasBearer) {
    return next();
  }

  // 5. For browser requests using ambient session cookies, perform CSRF validation
  if (req.cookies?.token) {
    const rawOrigin =
      req.headers["origin"] ||
      (req.headers["referer"] ? new URL(req.headers["referer"]).origin : null);

    if (!rawOrigin) {
      // In non-production, permit tools without origin headers (e.g. Postman, curl, tests)
      if (!isProduction) {
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

    // Token comparison if provided by client header
    const cookieCsrfToken = req.cookies?.csrfToken || req.cookies?.["XSRF-TOKEN"];
    const clientCsrfToken =
      req.headers["x-csrf-token"] ||
      req.headers["x-xsrf-token"] ||
      req.body?._csrf;

    if (cookieCsrfToken && clientCsrfToken) {
      const isValid =
        Buffer.byteLength(cookieCsrfToken) === Buffer.byteLength(clientCsrfToken) &&
        crypto.timingSafeEqual(
          Buffer.from(cookieCsrfToken),
          Buffer.from(clientCsrfToken)
        );
      if (!isValid) {
        return res.status(403).json({
          success: false,
          message: "CSRF verification failed: Invalid CSRF token.",
        });
      }
    }
  }

  next();
};

export default csrfProtection;
