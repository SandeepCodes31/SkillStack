import {
  recordLearningActivity,
  getStudentStreakDetails,
  getStudentBadgesDetails,
  getStudentActivityCalendar,
  getStudentMonthlyStats,
  getAdminStreakAnalytics,
} from "../services/streak.service.js";
import { User } from "../models/user.model.js";

/**
 * GET /api/v1/streak/my
 * Retrieves the authenticated student's current streak, longest streak,
 * learned-today status, and weekly activity tracker.
 */
export const getMyStreak = async (req, res) => {
  try {
    const studentId = req.id;
    const timezone = req.headers["x-timezone"] || req.query.timezone || "Asia/Kolkata";

    const streakData = await getStudentStreakDetails(studentId, timezone);
    return res.status(200).json({
      success: true,
      data: streakData,
    });
  } catch (error) {
    console.error("getMyStreak error:", error);
    return res.status(500).json({ success: false, message: "Failed to load streak details." });
  }
};

/**
 * GET /api/v1/streak/badges
 * Retrieves all platform badges with student's earned status, earned dates,
 * and progress toward the next badge.
 */
export const getMyBadges = async (req, res) => {
  try {
    const studentId = req.id;
    const badgesData = await getStudentBadgesDetails(studentId);
    return res.status(200).json({
      success: true,
      data: badgesData,
    });
  } catch (error) {
    console.error("getMyBadges error:", error);
    return res.status(500).json({ success: false, message: "Failed to load badges." });
  }
};

/**
 * GET /api/v1/streak/activity
 * Retrieves GitHub-style activity contribution calendar data for past N days.
 */
export const getMyActivity = async (req, res) => {
  try {
    const studentId = req.id;
    const days = parseInt(req.query.days) || 112; // 16 weeks
    const timezone = req.headers["x-timezone"] || req.query.timezone || "Asia/Kolkata";

    const activityData = await getStudentActivityCalendar(studentId, days, timezone);
    return res.status(200).json({
      success: true,
      data: activityData,
    });
  } catch (error) {
    console.error("getMyActivity error:", error);
    return res.status(500).json({ success: false, message: "Failed to load activity history." });
  }
};

/**
 * GET /api/v1/streak/stats
 * Retrieves monthly learning statistics for current calendar month.
 */
export const getMyStats = async (req, res) => {
  try {
    const studentId = req.id;
    const timezone = req.headers["x-timezone"] || req.query.timezone || "Asia/Kolkata";

    const stats = await getStudentMonthlyStats(studentId, timezone);
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("getMyStats error:", error);
    return res.status(500).json({ success: false, message: "Failed to load monthly statistics." });
  }
};

/**
 * GET /api/v1/streak/admin/analytics
 * Platform-wide streak and engagement analytics for administrators.
 */
export const getAdminAnalytics = async (req, res) => {
  try {
    const adminId = req.id;
    const user = await User.findById(adminId);
    if (!user || (user.role !== "admin" && user.role !== "instructor")) {
      return res.status(403).json({ success: false, message: "Access denied. Admin only." });
    }

    const timezone = req.headers["x-timezone"] || req.query.timezone || "Asia/Kolkata";
    const analytics = await getAdminStreakAnalytics(timezone);

    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("getAdminAnalytics error:", error);
    return res.status(500).json({ success: false, message: "Failed to load streak analytics." });
  }
};
