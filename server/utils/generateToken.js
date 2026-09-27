import jwt from "jsonwebtoken";
import crypto from "crypto";

const getCookieSecret = () => {
  const secret = process.env.SECRET_KEY || "skillstack_enterprise_cookie_key_32chars";
  return crypto.createHash("sha256").update(secret).digest();
};

/**
 * Encrypt sensitive session token before storing in HTTP cookie
 */
export const encryptCookie = (plaintext) => {
  if (!plaintext || typeof plaintext !== "string") return plaintext;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getCookieSecret(), iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}.${authTag}.${encrypted}`;
};

/**
 * Decrypt session token read from HTTP cookie
 */
export const decryptCookie = (cipherText) => {
  if (!cipherText || typeof cipherText !== "string" || !cipherText.includes(".")) {
    return cipherText;
  }
  try {
    const parts = cipherText.split(".");
    if (parts.length !== 3) return cipherText;
    const [ivHex, tagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-gcm", getCookieSecret(), iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return cipherText;
  }
};

/**
 * Robust token extractor and verifier that handles:
 * 1. Explicit Authorization: Bearer <token>
 * 2. Decrypted cookie token
 * 3. Raw cookie token (for legacy/unencrypted sessions)
 */
export const extractAndVerifyToken = (req) => {
  const secretKey =
    process.env.SECRET_KEY || "snjekfiejgcxkakasdfjd_skillstack_jwt_secret_2026";

  const candidates = [];

  // 1. Authorization header (Bearer token)
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    const bToken = authHeader.slice(7).trim();
    if (bToken) candidates.push(bToken);
  }

  // 2. Cookie token (decrypted and raw)
  const rawCookie = req.cookies?.token;
  if (rawCookie && typeof rawCookie === "string") {
    const decrypted = decryptCookie(rawCookie);
    if (decrypted && !candidates.includes(decrypted)) {
      candidates.push(decrypted);
    }
    if (rawCookie !== decrypted && !candidates.includes(rawCookie)) {
      candidates.push(rawCookie);
    }
  }

  // 3. Verify each candidate until one succeeds
  for (const candidate of candidates) {
    try {
      const decoded = jwt.verify(candidate, secretKey);
      if (decoded && (decoded.userId || decoded.id)) {
        return {
          userId: decoded.userId || decoded.id,
          role: decoded.role,
          token: candidate,
        };
      }
    } catch {
      // Continue to next candidate
    }
  }

  return null;
};

export const generateToken = (res, user, message) => {
  const secretKey =
    process.env.SECRET_KEY || "snjekfiejgcxkakasdfjd_skillstack_jwt_secret_2026";
  const token = jwt.sign({ userId: user._id, role: user.role }, secretKey, {
    expiresIn: "7d",
  });

  const isProduction =
    process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

  if (isProduction && !process.env.SECRET_KEY) {
    console.warn(
      "[SECURITY WARNING] Running in production without a custom SECRET_KEY env variable! Set SECRET_KEY in your hosting dashboard."
    );
  }

  const userSafe = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified ?? true,
    photoURL: user.photoURL || "",
    enrolledCourses: user.enrolledCourses || [],
  };

  const encryptedCookie = encryptCookie(token);

  // Cross-site compatible cookie configuration
  const cookieOptions = {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };

  return res
    .status(200)
    .cookie("token", encryptedCookie, cookieOptions)
    .json({
      success: true,
      message,
      user: userSafe,
      token,
    });
};
