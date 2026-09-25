import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const isAuthenticated = async (req, res, next) => {
  // ✅ allow CORS preflight to pass
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        message: "User not Authenticated",
        success: false,
      });
    }
    const secretKey =
      process.env.SECRET_KEY || "snjekfiejgcxkakasdfjd_skillstack_jwt_secret_2026";
    const decode = jwt.verify(token, secretKey);
    req.id = decode.userId;
    req.role = decode.role;
    next();
  } catch (error) {
    console.log("AUTH ERROR:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
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

export default isAuthenticated;
