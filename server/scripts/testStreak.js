import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { LearningStreak } from "../models/learningStreak.model.js";
import { LearningActivity } from "../models/learningActivity.model.js";
import { Badge } from "../models/badge.model.js";
import { StudentBadge } from "../models/studentBadge.model.js";
import {
  recordLearningActivity,
  getStudentStreakDetails,
  getStudentBadgesDetails,
  getStudentActivityCalendar,
  getStudentMonthlyStats,
  getAdminStreakAnalytics,
  getCalendarDaysDiff,
  getCalendarDate,
} from "../services/streak.service.js";
import { seedBadges } from "./seedBadges.js";

dotenv.config({});

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lms";

const runStreakTests = async () => {
  try {
    console.log("=== STARTING STREAK & BADGE SYSTEM VERIFICATION ===");

    await mongoose.connect(MONGO_URI);
    await seedBadges();

    // 1. Setup Test Student
    let testStudent = await User.findOne({ email: "streak_test_student@example.com" });
    if (!testStudent) {
      testStudent = await User.create({
        name: "Streak Tester",
        email: "streak_test_student@example.com",
        password: "testPassword123",
        role: "student",
      });
    }

    const studentId = testStudent._id;

    // Clean up previous test runs for this student
    await LearningStreak.deleteMany({ studentId });
    await LearningActivity.deleteMany({ studentId });
    await StudentBadge.deleteMany({ studentId });

    console.log(`Test Student ID: ${studentId}`);

    // ==========================================
    // CASE 1: Brand New Student
    // ==========================================
    console.log("\n[Test 1] New student with zero prior activities:");
    const initialDetails = await getStudentStreakDetails(studentId);
    console.log(`-> Current Streak: ${initialDetails.currentStreak}`);
    console.log(`-> Longest Streak: ${initialDetails.longestStreak}`);
    console.log(`-> Learned Today: ${initialDetails.learnedToday}`);
    if (initialDetails.currentStreak === 0 && initialDetails.longestStreak === 0 && !initialDetails.learnedToday) {
      console.log("-> PASS: Initial state is clean (streak = 0)");
    } else {
      throw new Error("Test 1 Failed: New student should have 0 streak");
    }

    // ==========================================
    // CASE 2: First Learning Activity Today
    // ==========================================
    console.log("\n[Test 2] Student completes first lesson today:");
    const today = "2026-09-15";
    const res1 = await recordLearningActivity(studentId, {
      activityType: "LESSON_COMPLETED",
      lessonId: "lec_1",
      customDate: today,
    });
    console.log(`-> Current Streak: ${res1.currentStreak}`);
    console.log(`-> Longest Streak: ${res1.longestStreak}`);
    console.log(`-> Total Learning Days: ${res1.totalLearningDays}`);
    if (res1.currentStreak === 1 && res1.longestStreak === 1 && res1.totalLearningDays === 1) {
      console.log("-> PASS: First activity initialized streak to 1");
    } else {
      throw new Error("Test 2 Failed: First activity should set streak to 1");
    }

    // ==========================================
    // CASE 3: Multiple Same-Day Activities (Anti-Cheat / Deduplication)
    // ==========================================
    console.log("\n[Test 3] Student completes 4 more activities on the SAME day:");
    await recordLearningActivity(studentId, {
      activityType: "LESSON_COMPLETED",
      lessonId: "lec_2",
      customDate: today,
    });
    await recordLearningActivity(studentId, {
      activityType: "LESSON_COMPLETED",
      lessonId: "lec_3",
      customDate: today,
    });
    await recordLearningActivity(studentId, {
      activityType: "QUIZ_COMPLETED",
      quizId: new mongoose.Types.ObjectId(),
      customDate: today,
    });
    const resSameDay = await recordLearningActivity(studentId, {
      activityType: "MODULE_COMPLETED",
      customDate: today,
    });

    console.log(`-> Current Streak after 5 total same-day activities: ${resSameDay.currentStreak}`);
    console.log(`-> Already Active Today: ${resSameDay.alreadyActiveToday}`);
    if (resSameDay.currentStreak === 1 && resSameDay.alreadyActiveToday === true) {
      console.log("-> PASS: Streak remained 1 despite 5 activities on the same date!");
    } else {
      throw new Error(`Test 3 Failed: Same-day activities must NOT increase streak. Got ${resSameDay.currentStreak}`);
    }

    // ==========================================
    // CASE 4: Consecutive Day Learning
    // ==========================================
    console.log("\n[Test 4] Student learns on consecutive day (Day 2):");
    const day2 = "2026-09-16";
    const resDay2 = await recordLearningActivity(studentId, {
      activityType: "LESSON_COMPLETED",
      lessonId: "lec_4",
      customDate: day2,
    });
    console.log(`-> Current Streak: ${resDay2.currentStreak}`);
    console.log(`-> Longest Streak: ${resDay2.longestStreak}`);
    if (resDay2.currentStreak === 2 && resDay2.longestStreak === 2) {
      console.log("-> PASS: Streak incremented to 2 on consecutive day!");
    } else {
      throw new Error(`Test 4 Failed: Consecutive day should increment streak to 2. Got ${resDay2.currentStreak}`);
    }

    // ==========================================
    // CASE 5: Continue streak to Day 3, then skip Day 4 and return Day 5
    // ==========================================
    console.log("\n[Test 5] Student learns on Day 3, skips Day 4, returns on Day 5:");
    const day3 = "2026-09-17";
    await recordLearningActivity(studentId, {
      activityType: "LESSON_COMPLETED",
      lessonId: "lec_5",
      customDate: day3,
    });

    // Skip Day 4 (2026-09-18)
    // Return on Day 5 (2026-09-19)
    const day5 = "2026-09-19";
    const resDay5 = await recordLearningActivity(studentId, {
      activityType: "LESSON_COMPLETED",
      lessonId: "lec_6",
      customDate: day5,
    });

    console.log(`-> Current Streak after skipping Day 4: ${resDay5.currentStreak}`);
    console.log(`-> Longest Streak preserved: ${resDay5.longestStreak}`);
    if (resDay5.currentStreak === 1 && resDay5.longestStreak === 3) {
      console.log("-> PASS: Streak reset to 1 after skipped day, and longest streak (3) was preserved!");
    } else {
      throw new Error(`Test 5 Failed: Streak break handling incorrect. Got current: ${resDay5.currentStreak}, longest: ${resDay5.longestStreak}`);
    }

    // ==========================================
    // CASE 6: Milestone Badges Unlocked (3-Day & 7-Day & 30-Day)
    // ==========================================
    console.log("\n[Test 6] Simulating consecutive daily streak from Day 5 to reach 7-day milestone:");
    // Already did day5 (streak = 1). Let's simulate up to 7 consecutive days:
    const dates = [
      "2026-09-20", // streak 2
      "2026-09-21", // streak 3 -> triggers 3-Day Starter badge!
      "2026-09-22", // streak 4
      "2026-09-23", // streak 5
      "2026-09-24", // streak 6
      "2026-09-25", // streak 7 -> triggers 7-Day Learner badge!
    ];

    let unlockedBadgesList = [];
    for (const d of dates) {
      const r = await recordLearningActivity(studentId, {
        activityType: "LESSON_COMPLETED",
        lessonId: `lec_${d}`,
        customDate: d,
      });
      if (r.newlyUnlockedBadges?.length > 0) {
        unlockedBadgesList.push(...r.newlyUnlockedBadges);
      }
    }

    const earnedBadges = await StudentBadge.find({ studentId }).populate("badge");
    console.log(`-> Total Badges Earned: ${earnedBadges.length}`);
    earnedBadges.forEach((b) => {
      console.log(`   * ${b.badge.icon} ${b.badge.name} (${b.badgeId}) - Earned at Streak: ${b.currentStreakWhenEarned}`);
    });

    const has3Day = earnedBadges.some((b) => b.badgeId === "STREAK_3");
    const has7Day = earnedBadges.some((b) => b.badgeId === "STREAK_7");

    if (has3Day && has7Day) {
      console.log("-> PASS: 3-Day Starter and 🥉 7-Day Learner badges successfully unlocked!");
    } else {
      throw new Error("Test 6 Failed: Milestone badges STREAK_3 or STREAK_7 were not unlocked");
    }

    // ==========================================
    // CASE 7: Duplicate Badge Prevention
    // ==========================================
    console.log("\n[Test 7] Verifying badges cannot be duplicated:");
    const duplicateCountBefore = await StudentBadge.countDocuments({ studentId, badgeId: "STREAK_7" });
    // Trigger badge evaluation again
    const recheckBadges = await recordLearningActivity(studentId, {
      activityType: "QUIZ_COMPLETED",
      customDate: "2026-09-25", // Same day
    });
    const duplicateCountAfter = await StudentBadge.countDocuments({ studentId, badgeId: "STREAK_7" });
    console.log(`-> STREAK_7 badge count before: ${duplicateCountBefore}, after: ${duplicateCountAfter}`);
    if (duplicateCountBefore === 1 && duplicateCountAfter === 1) {
      console.log("-> PASS: Duplicate badges strictly prevented by compound unique index!");
    } else {
      throw new Error("Test 7 Failed: Duplicate badge was created");
    }

    // ==========================================
    // CASE 8: Fast-Forward to 30-Day Milestone
    // ==========================================
    console.log("\n[Test 8] Fast-forwarding consecutive days to test 30-Day Learner badge:");
    for (let dayNum = 26; dayNum <= 48; dayNum++) {
      const month = dayNum <= 30 ? "09" : "10";
      const dayStr = dayNum <= 30 ? String(dayNum).padStart(2, "0") : String(dayNum - 30).padStart(2, "0");
      const d = `2026-${month}-${dayStr}`;
      await recordLearningActivity(studentId, {
        activityType: "LESSON_COMPLETED",
        lessonId: `lec_fast_${dayNum}`,
        customDate: d,
      });
    }

    const streak30 = await LearningStreak.findOne({ studentId });
    console.log(`-> Streak after fast-forward: ${streak30.currentStreak} days`);
    const studentBadges30 = await StudentBadge.find({ studentId });
    const has30Day = studentBadges30.some((b) => b.badgeId === "STREAK_30");
    const has14Day = studentBadges30.some((b) => b.badgeId === "STREAK_14");
    console.log(`-> 14-Day Badge earned: ${has14Day}, 30-Day Badge earned: ${has30Day}`);
    if (streak30.currentStreak >= 30 && has30Day && has14Day) {
      console.log("-> PASS: 🥈 30-Day Learner and ⚡ 14-Day Consistent badges successfully unlocked!");
    } else {
      throw new Error("Test 8 Failed: 30-Day Learner badge was not awarded");
    }

    // ==========================================
    // CASE 9: Activity Calendar Heatmap Generation
    // ==========================================
    console.log("\n[Test 9] Verifying activity heatmap aggregation:");
    const heatmap = await getStudentActivityCalendar(studentId, 112, "Asia/Kolkata", "2026-10-18");
    console.log(`-> Total calendar days returned: ${heatmap.calendarDays.length}`);
    const activeCalendarDays = heatmap.calendarDays.filter((d) => d.count > 0);
    console.log(`-> Days with recorded activity: ${activeCalendarDays.length}`);
    if (heatmap.calendarDays.length > 100 && activeCalendarDays.length >= 30) {
      console.log("-> PASS: Heatmap correctly aggregated 30+ active days with intensities!");
    } else {
      throw new Error("Test 9 Failed: Heatmap data incomplete");
    }

    // ==========================================
    // CASE 10: Monthly Statistics & Admin Analytics
    // ==========================================
    console.log("\n[Test 10] Verifying monthly statistics and admin analytics:");
    const monthlyStats = await getStudentMonthlyStats(studentId);
    console.log(`-> Monthly stats for ${monthlyStats.month}: Learning days: ${monthlyStats.learningDays}, Lessons: ${monthlyStats.lessonsCompleted}`);

    const adminAnalytics = await getAdminStreakAnalytics();
    console.log(`-> Admin Engagement: Active Students: ${adminAnalytics.totalActiveStudents}, Students with streak: ${adminAnalytics.studentsWithStreak}, Max streak: ${adminAnalytics.longestActiveStreak}, Total badges: ${adminAnalytics.totalBadgesEarned}`);

    if (monthlyStats.learningDays > 0 && adminAnalytics.totalActiveStudents > 0 && adminAnalytics.longestActiveStreak >= 30) {
      console.log("-> PASS: Monthly statistics and admin engagement analytics verified!");
    } else {
      throw new Error("Test 10 Failed: Statistics verification failed");
    }

    console.log("\n=== ALL 10 STREAK & BADGE VERIFICATION TESTS PASSED PERFECTLY ===");
  } catch (error) {
    console.error("Test execution failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

runStreakTests();
