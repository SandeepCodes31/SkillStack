import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { extractAndVerifyToken } from "../utils/generateToken.js";

const isAuthenticated = async (req, res, next) => {
  // Allow CORS preflight to pass smoothly
  if (req.method === "OPTIONS") {
    return next();
  }

  const authData = extractAndVerifyToken(req);
  if (!authData) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated. Please log in.",
    });
  }

  try {
    const user = await User.findById(authData.userId).select("_id role isVerified name email");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Account not found. Please log in again.",
      });
    }

    req.id = user._id.toString();
    req.role = user.role;
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication DB verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication verification failed",
    });
  }
};

export const authorizeAdmin = async (req, res, next) => {
  try {
    let role = req.role;
    if (!role) {
      const user = await User.findById(req.id);
      role = user?.role;
    }
    const isAdmin = role === "admin" || role === "instructor";
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authorization error",
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const authData = extractAndVerifyToken(req);
    if (authData?.userId) {
      req.id = authData.userId.toString();
      req.role = authData.role;
    }
  } catch (error) {
    // Guest visitor; continue smoothly without req.id
  }
  next();
};

export default isAuthenticated;
