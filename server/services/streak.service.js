import { LearningStreak } from "../models/learningStreak.model.js";
import { LearningActivity } from "../models/learningActivity.model.js";
import { Badge } from "../models/badge.model.js";
import { StudentBadge } from "../models/studentBadge.model.js";
import { User } from "../models/user.model.js";

/**
 * Formats a Date into a calendar date string (YYYY-MM-DD) according to the specified timezone.
 * Defaults to "Asia/Kolkata" or falls back gracefully.
 */
export const getCalendarDate = (date = new Date(), timeZone = "Asia/Kolkata") => {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timeZone || "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date instanceof Date ? date : new Date(date));
  } catch (err) {
    return new Date(date).toISOString().split("T")[0];
  }
};

/**
 * Calculates the exact integer calendar days difference between two YYYY-MM-DD strings.
 * Returns:
 *   0  -> Same calendar day
 *   1  -> dateStr2 is the very next day after dateStr1 (consecutive)
 *  >1  -> More than one day apart (streak break)
 *  <0  -> dateStr2 is in the past compared to dateStr1
 */
export const getCalendarDaysDiff = (dateStr1, dateStr2) => {
  if (!dateStr1 || !dateStr2) return null;
  const [y1, m1, d1] = dateStr1.split("-").map(Number);
  const [y2, m2, d2] = dateStr2.split("-").map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((utc2 - utc1) / msPerDay);
};

/**
 * Checks and awards any newly eligible streak badges for the student.
 * Returns array of newly unlocked badges.
 */
export const checkAndAwardBadges = async (studentId, currentStreak) => {
  try {
    // Find all streak-based badges whose requirement is met
    const eligibleBadges = await Badge.find({
      category: "STREAK",
      requirementType: "STREAK_DAYS",
      requirementValue: { $lte: currentStreak },
    }).sort({ requirementValue: 1 });

    const newlyUnlocked = [];

    for (const badge of eligibleBadges) {
      // Check if already earned
      const existing = await StudentBadge.findOne({
        studentId,
        badgeId: badge.badgeId,
      });

      if (!existing) {
        try {
          const studentBadge = await StudentBadge.create({
            studentId,
            badgeId: badge.badgeId,
            badge: badge._id,
            earnedAt: new Date(),
            currentStreakWhenEarned: currentStreak,
          });

          newlyUnlocked.push({
            badgeId: badge.badgeId,
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            tier: badge.tier,
            earnedAt: studentBadge.earnedAt,
          });
        } catch (duplicateErr) {
          // Compound index handled race condition safely
        }
      }
    }

    return newlyUnlocked;
  } catch (error) {
    console.error("checkAndAwardBadges error:", error);
    return [];
  }
};

/**
 * Centralized Service Method:
 * Records a learning activity and atomically updates the student's learning streak.
 * 
 * Rules:
 * 1. Multiple activities on the SAME calendar day count as 1 learning day. Streak does NOT increase again.
 * 2. Activity on consecutive calendar day (yesterday was active) increases currentStreak by 1.
 * 3. Activity after missing a day resets currentStreak to 1.
 * 4. Longest streak is preserved and never decreases.
 * 5. Milestone badges are checked and awarded on the backend only.
 */
export const recordLearningActivity = async (studentId, activityData = {}) => {
  try {
    const {
      activityType = "LESSON_COMPLETED",
      courseId = null,
      lessonId = null,
      quizId = null,
      metadata = {},
      timezone = "Asia/Kolkata",
      customDate = null, // Used for tests/simulations
    } = activityData;

    // 1. Verify student exists
    const student = await User.findById(studentId);
    if (!student) {
      return { success: false, message: "Student not found." };
    }

    // 2. Determine target calendar date in student's timezone
    const todayStr = customDate || getCalendarDate(new Date(), timezone);

    // 3. Check if ANY learning activity has already been recorded for this student on todayStr
    const existingActivitiesToday = await LearningActivity.countDocuments({
      studentId,
      date: todayStr,
    });

    const isFirstActivityToday = existingActivitiesToday === 0;

    // 4. Save the LearningActivity document (records audit trail & heatmap data)
    // Avoid creating duplicate activity document if the exact same lesson was submitted in quick succession
    let activityRecord = null;
    if (lessonId) {
      const duplicateRecent = await LearningActivity.findOne({
        studentId,
        date: todayStr,
        activityType,
        lessonId,
      });
      if (!duplicateRecent) {
        activityRecord = await LearningActivity.create({
          studentId,
          activityType,
          courseId,
          lessonId,
          quizId,
          date: todayStr,
          metadata,
        });
      }
    } else {
      activityRecord = await LearningActivity.create({
        studentId,
        activityType,
        courseId,
        lessonId,
        quizId,
        date: todayStr,
        metadata,
      });
    }

    // 5. Fetch or initialize student's LearningStreak document
    let streakDoc = await LearningStreak.findOne({ studentId });
    if (!streakDoc) {
      streakDoc = new LearningStreak({
        studentId,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        streakStartDate: todayStr,
        totalLearningDays: 0,
      });
    }

    let newlyUnlockedBadges = [];
    let streakIncreased = false;

    // 6. Streak calculation based on calendar day difference
    if (isFirstActivityToday) {
      if (!streakDoc.lastActivityDate) {
        // Brand new student: first learning day ever!
        streakDoc.currentStreak = 1;
        streakDoc.longestStreak = Math.max(streakDoc.longestStreak || 0, 1);
        streakDoc.streakStartDate = todayStr;
        streakDoc.totalLearningDays = 1;
        streakIncreased = true;
      } else {
        const diffDays = getCalendarDaysDiff(streakDoc.lastActivityDate, todayStr);

        if (diffDays === 1) {
          // Active yesterday -> consecutive calendar day!
          streakDoc.currentStreak = (streakDoc.currentStreak || 0) + 1;
          streakDoc.longestStreak = Math.max(streakDoc.longestStreak || 0, streakDoc.currentStreak);
          streakDoc.totalLearningDays = (streakDoc.totalLearningDays || 0) + 1;
          streakIncreased = true;
        } else if (diffDays > 1) {
          // Missed one or more days -> streak broken, start new streak today!
          streakDoc.currentStreak = 1;
          streakDoc.streakStartDate = todayStr;
          streakDoc.totalLearningDays = (streakDoc.totalLearningDays || 0) + 1;
          streakIncreased = true;
        } else if (diffDays === 0) {
          // Same day fallback (handled by isFirstActivityToday, but kept for robustness)
        }
      }

      streakDoc.lastActivityDate = todayStr;
      await streakDoc.save();

      // 7. Check for newly unlocked milestone badges
      newlyUnlockedBadges = await checkAndAwardBadges(studentId, streakDoc.currentStreak);
    } else {
      // Already active today: do not increment streak again!
      // Keep streak unchanged
    }

    return {
      success: true,
      currentStreak: streakDoc.currentStreak,
      longestStreak: streakDoc.longestStreak,
      totalLearningDays: streakDoc.totalLearningDays,
      lastActivityDate: streakDoc.lastActivityDate,
      alreadyActiveToday: !isFirstActivityToday,
      streakIncreased,
      newlyUnlockedBadges,
    };
  } catch (error) {
    console.error("recordLearningActivity error:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Retrieves comprehensive streak data for the student dashboard.
 */
export const getStudentStreakDetails = async (studentId, timezone = "Asia/Kolkata") => {
  try {
    const todayStr = getCalendarDate(new Date(), timezone);

    let streakDoc = await LearningStreak.findOne({ studentId });
    if (!streakDoc) {
      streakDoc = {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        streakStartDate: null,
        totalLearningDays: 0,
      };
    }

    // Determine if student learned today
    const learnedToday = streakDoc.lastActivityDate === todayStr;

    // Check if previous streak has broken (last activity was before yesterday and not today)
    let isStreakBroken = false;
    let daysSinceLastActivity = 0;
    let effectiveCurrentStreak = streakDoc.currentStreak;

    if (streakDoc.lastActivityDate) {
      daysSinceLastActivity = getCalendarDaysDiff(streakDoc.lastActivityDate, todayStr);
      if (daysSinceLastActivity > 1) {
        isStreakBroken = true;
        effectiveCurrentStreak = 0; // Inactive until they learn today
      }
    }

    // Generate Weekly Tracker (Monday to Sunday of current week)
    const todayDate = new Date();
    // In JS, getDay() returns 0 for Sunday, 1 for Monday...
    const currentDayOfWeek = todayDate.getDay(); // 0 (Sun) to 6 (Sat)
    // Convert to Monday-indexed: Mon = 0, Tue = 1 ... Sun = 6
    const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;

    const mondayDate = new Date(todayDate);
    mondayDate.setDate(todayDate.getDate() + mondayOffset);

    const weekDays = [];
    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // Query all activities for student in this week
    const weekStartStr = getCalendarDate(mondayDate, timezone);
    const sundayDate = new Date(mondayDate);
    sundayDate.setDate(mondayDate.getDate() + 6);
    const weekEndStr = getCalendarDate(sundayDate, timezone);

    const weekActivities = await LearningActivity.find({
      studentId,
      date: { $gte: weekStartStr, $lte: weekEndStr },
    }).select("date");

    const activeDatesSet = new Set(weekActivities.map((a) => a.date));

    for (let i = 0; i < 7; i++) {
      const d = new Date(mondayDate);
      d.setDate(mondayDate.getDate() + i);
      const dateStr = getCalendarDate(d, timezone);
      const isToday = dateStr === todayStr;
      const isPast = dateStr < todayStr;
      const isCompleted = activeDatesSet.has(dateStr);

      weekDays.push({
        dayName: dayLabels[i],
        date: dateStr,
        dayNumber: d.getDate(),
        isCompleted,
        isToday,
        isPast,
      });
    }

    // Next badge milestone info
    const badgesData = await getStudentBadgesDetails(studentId, effectiveCurrentStreak);

    return {
      success: true,
      currentStreak: streakDoc.currentStreak,
      effectiveCurrentStreak,
      longestStreak: streakDoc.longestStreak,
      totalLearningDays: streakDoc.totalLearningDays,
      lastActivityDate: streakDoc.lastActivityDate,
      learnedToday,
      isStreakBroken,
      daysSinceLastActivity,
      streakStartDate: streakDoc.streakStartDate,
      weeklyActivity: weekDays,
      nextBadge: badgesData.nextBadge,
    };
  } catch (error) {
    console.error("getStudentStreakDetails error:", error);
    throw error;
  }
};

/**
 * Retrieves all badges with earned status, requirements, and progress toward next badge.
 */
export const getStudentBadgesDetails = async (studentId, currentStreak = null) => {
  try {
    let streakValue = currentStreak;
    if (streakValue === null) {
      const streakDoc = await LearningStreak.findOne({ studentId });
      streakValue = streakDoc?.currentStreak || 0;
    }

    const allBadges = await Badge.find().sort({ requirementValue: 1 });
    const earnedStudentBadges = await StudentBadge.find({ studentId });
    const earnedMap = new Map();
    earnedStudentBadges.forEach((sb) => {
      earnedMap.set(sb.badgeId, sb);
    });

    const badgesList = [];
    let nextBadge = null;

    for (const badge of allBadges) {
      const isEarned = earnedMap.has(badge.badgeId);
      const earnedRecord = earnedMap.get(badge.badgeId);

      const badgeItem = {
        _id: badge._id,
        badgeId: badge.badgeId,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        tier: badge.tier,
        category: badge.category,
        requirementType: badge.requirementType,
        requirementValue: badge.requirementValue,
        isEarned,
        earnedAt: earnedRecord?.earnedAt || null,
        currentStreakWhenEarned: earnedRecord?.currentStreakWhenEarned || null,
        progress: Math.min(badge.requirementValue, streakValue),
        progressPercentage: Math.min(
          100,
          Math.round((streakValue / badge.requirementValue) * 100)
        ),
        daysRemaining: Math.max(0, badge.requirementValue - streakValue),
      };

      badgesList.push(badgeItem);

      if (!isEarned && !nextBadge) {
        nextBadge = badgeItem;
      }
    }

    return {
      success: true,
      totalBadges: allBadges.length,
      earnedCount: earnedStudentBadges.length,
      badges: badgesList,
      nextBadge,
    };
  } catch (error) {
    console.error("getStudentBadgesDetails error:", error);
    throw error;
  }
};

/**
 * Retrieves GitHub-style activity contribution calendar data for past N days (~16 weeks).
 */
export const getStudentActivityCalendar = async (studentId, days = 112, timezone = "Asia/Kolkata", endDate = null) => {
  try {
    const today = endDate ? (endDate instanceof Date ? endDate : new Date(endDate)) : new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days);

    const startDateStr = getCalendarDate(startDate, timezone);
    const todayStr = getCalendarDate(today, timezone);

    // Aggregate learning activities grouped by date
    const activities = await LearningActivity.aggregate([
      {
        $match: {
          studentId,
          date: { $gte: startDateStr, $lte: todayStr },
        },
      },
      {
        $group: {
          _id: "$date",
          count: { $sum: 1 },
          types: { $push: "$activityType" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const activityMap = new Map();
    activities.forEach((item) => {
      activityMap.set(item._id, {
        count: item.count,
        types: item.types,
      });
    });

    // Build day-by-day sequence
    const calendarDays = [];
    for (let i = days; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = getCalendarDate(d, timezone);
      const activityData = activityMap.get(dateStr) || { count: 0, types: [] };
      const count = activityData.count;

      // Intensity scale 0 to 4
      let intensity = 0;
      if (count >= 5) intensity = 4;
      else if (count >= 3) intensity = 3;
      else if (count >= 2) intensity = 2;
      else if (count >= 1) intensity = 1;

      calendarDays.push({
        date: dateStr,
        dayOfWeek: d.getDay(),
        count,
        intensity,
        types: activityData.types,
      });
    }

    return {
      success: true,
      totalDaysTracked: days,
      calendarDays,
    };
  } catch (error) {
    console.error("getStudentActivityCalendar error:", error);
    throw error;
  }
};

/**
 * Retrieves monthly learning statistics for the student.
 */
export const getStudentMonthlyStats = async (studentId, timezone = "Asia/Kolkata") => {
  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
    const monthPrefix = `${currentYear}-${currentMonth}`; // e.g. "2026-09"

    const streakDoc = await LearningStreak.findOne({ studentId });

    // Aggregate activities in current month
    const monthlyActivities = await LearningActivity.find({
      studentId,
      date: { $regex: `^${monthPrefix}` },
    });

    const uniqueDates = new Set(monthlyActivities.map((a) => a.date));
    const learningDays = uniqueDates.size;

    const lessonsCompleted = monthlyActivities.filter(
      (a) => a.activityType === "LESSON_COMPLETED" || a.activityType === "MODULE_COMPLETED"
    ).length;

    const quizzesCompleted = monthlyActivities.filter(
      (a) => a.activityType === "QUIZ_COMPLETED" || a.activityType === "ASSESSMENT_COMPLETED"
    ).length;

    const certificatesEarned = monthlyActivities.filter(
      (a) => a.activityType === "CERTIFICATE_EARNED" || a.activityType === "COURSE_COMPLETED"
    ).length;

    return {
      success: true,
      month: today.toLocaleString("en-US", { month: "long", year: "numeric" }),
      learningDays,
      lessonsCompleted,
      quizzesCompleted,
      certificatesEarned,
      totalActivities: monthlyActivities.length,
      currentStreak: streakDoc?.currentStreak || 0,
      longestStreak: streakDoc?.longestStreak || 0,
      totalLearningDays: streakDoc?.totalLearningDays || 0,
    };
  } catch (error) {
    console.error("getStudentMonthlyStats error:", error);
    throw error;
  }
};

/**
 * Admin: Platform-wide streak and engagement analytics.
 */
export const getAdminStreakAnalytics = async (timezone = "Asia/Kolkata") => {
  try {
    const todayStr = getCalendarDate(new Date(), timezone);

    // Active learning students (students with at least 1 recorded activity)
    const activeStudents = await LearningActivity.distinct("studentId");
    const totalActiveStudents = activeStudents.length;

    // Students with an active streak (> 0)
    const studentsWithStreak = await LearningStreak.countDocuments({
      currentStreak: { $gt: 0 },
    });

    // Aggregations for streaks
    const streakAgg = await LearningStreak.aggregate([
      {
        $group: {
          _id: null,
          avgStreak: { $avg: "$currentStreak" },
          maxStreak: { $max: "$longestStreak" },
          totalLearningDaysSum: { $sum: "$totalLearningDays" },
        },
      },
    ]);

    const avgStreak = streakAgg.length > 0 ? Math.round(streakAgg[0].avgStreak || 0) : 0;
    const longestActiveStreak = streakAgg.length > 0 ? streakAgg[0].maxStreak || 0 : 0;

    // Activities recorded today
    const activitiesToday = await LearningActivity.countDocuments({
      date: todayStr,
    });

    // Total activities platform-wide
    const totalActivities = await LearningActivity.countDocuments();

    // Total badges awarded
    const totalBadgesEarned = await StudentBadge.countDocuments();

    return {
      success: true,
      totalActiveStudents,
      studentsWithStreak,
      avgStreak,
      longestActiveStreak,
      activitiesToday,
      totalActivities,
      totalBadgesEarned,
    };
  } catch (error) {
    console.error("getAdminStreakAnalytics error:", error);
    throw error;
  }
};
