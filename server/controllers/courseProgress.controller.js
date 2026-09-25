import { CourseProgress } from "../models/courseProgress.js";
import { Course } from "../models/course.model.js";
import { recordLearningActivity } from "../services/streak.service.js";

export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const courseDetails = await Course.findById(courseId)
      .populate("lectures")
      .populate({ path: "creator", select: "name photoURL" });
    if (!courseDetails) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const totalLectures = courseDetails.lectures?.length || 0;
    let courseProgress = await CourseProgress.findOne({ courseId, userId });

    if (!courseProgress) {
      return res.status(200).json({
        data: {
          courseDetails,
          progress: [],
          completed: false,
          progressPercentage: 0,
          courseCompleted: false,
          finalAssessmentPassed: false,
          finalAssessmentScore: null,
          certificateId: null,
          completedAt: null,
        },
      });
    }

    const viewedCount = courseProgress.lectureProgress?.filter((l) => l.viewed)?.length || 0;
    const progressPercentage = totalLectures > 0 ? Math.min(100, Math.round((viewedCount / totalLectures) * 100)) : 100;
    const allLecturesCompleted = progressPercentage >= 100;

    // Keep completed field synchronized with actual lecture completion
    if (courseProgress.completed !== allLecturesCompleted || courseProgress.progressPercentage !== progressPercentage) {
      courseProgress.completed = allLecturesCompleted;
      courseProgress.progressPercentage = progressPercentage;
      await courseProgress.save();
    }

    return res.status(200).json({
      data: {
        courseDetails,
        progress: courseProgress.lectureProgress,
        completed: courseProgress.completed,
        progressPercentage,
        courseCompleted: courseProgress.courseCompleted || false,
        finalAssessmentPassed: courseProgress.finalAssessmentPassed || false,
        finalAssessmentScore: courseProgress.finalAssessmentScore || null,
        certificateId: courseProgress.certificateId || null,
        completedAt: courseProgress.completedAt || null,
      },
    });
  } catch (error) {
    console.error("getCourseProgress error:", error);
    return res.status(500).json({ message: "Failed to load course progress." });
  }
};

export const updateLectureProgress = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    let courseProgress = await CourseProgress.findOne({ courseId, userId });

    if (!courseProgress) {
      courseProgress = new CourseProgress({
        userId,
        courseId,
        completed: false,
        progressPercentage: 0,
        lectureProgress: [],
      });
    }

    const lectureIndex = courseProgress.lectureProgress.findIndex(
      (lecture) => lecture.lectureId === lectureId
    );

    if (lectureIndex !== -1) {
      courseProgress.lectureProgress[lectureIndex].viewed = true;
    } else {
      courseProgress.lectureProgress.push({
        lectureId,
        viewed: true,
      });
    }

    const totalLectures = course.lectures?.length || 0;
    const viewedCount = courseProgress.lectureProgress.filter((l) => l.viewed).length;
    const progressPercentage = totalLectures > 0 ? Math.min(100, Math.round((viewedCount / totalLectures) * 100)) : 100;

    courseProgress.progressPercentage = progressPercentage;
    courseProgress.completed = progressPercentage >= 100;

    await courseProgress.save();

    // Record learning activity and update student streak
    const timezone = req.headers["x-timezone"] || req.query.timezone || "Asia/Kolkata";
    let streakResult = null;
    try {
      streakResult = await recordLearningActivity(userId, {
        activityType: "LESSON_COMPLETED",
        courseId,
        lessonId,
        metadata: { courseTitle: course.courseTitle },
        timezone,
      });
    } catch (streakErr) {
      console.error("Streak update error in updateLectureProgress:", streakErr);
    }

    return res.status(200).json({
      message: "Lecture progress updated successfully.",
      progressPercentage,
      completed: courseProgress.completed,
      streak: streakResult,
    });
  } catch (error) {
    console.error("updateLectureProgress error:", error);
    return res.status(500).json({ message: "Failed to update lecture progress." });
  }
};

export const markAsCompleted = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    let courseProgress = await CourseProgress.findOne({ courseId, userId });
    if (!courseProgress) {
      courseProgress = new CourseProgress({
        userId,
        courseId,
        lectureProgress: [],
      });
    }

    // Mark all actual lectures of the course as viewed
    const allLecturesProgress = course.lectures.map((lecId) => ({
      lectureId: lecId.toString(),
      viewed: true,
    }));

    courseProgress.lectureProgress = allLecturesProgress;
    courseProgress.completed = true;
    courseProgress.progressPercentage = 100;
    await courseProgress.save();

    // Record learning activity and update student streak
    const timezone = req.headers["x-timezone"] || req.query.timezone || "Asia/Kolkata";
    let streakResult = null;
    try {
      streakResult = await recordLearningActivity(userId, {
        activityType: "MODULE_COMPLETED",
        courseId,
        metadata: { courseTitle: course.courseTitle },
        timezone,
      });
    } catch (streakErr) {
      console.error("Streak update error in markAsCompleted:", streakErr);
    }

    return res.status(200).json({
      message: "All lessons marked as completed. Final Assessment is now unlocked!",
      progressPercentage: 100,
      completed: true,
      streak: streakResult,
    });
  } catch (error) {
    console.error("markAsCompleted error:", error);
    return res.status(500).json({ message: "Failed to mark course completed." });
  }
};

export const markAsInCompleted = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const courseProgress = await CourseProgress.findOne({ courseId, userId });
    if (!courseProgress) {
      return res.status(404).json({ message: "Course progress not found" });
    }

    courseProgress.lectureProgress.forEach((lp) => {
      lp.viewed = false;
    });
    courseProgress.completed = false;
    courseProgress.progressPercentage = 0;
    await courseProgress.save();

    return res.status(200).json({
      message: "Course progress reset.",
      progressPercentage: 0,
      completed: false,
    });
  } catch (error) {
    console.error("markAsInCompleted error:", error);
    return res.status(500).json({ message: "Failed to reset course progress." });
  }
};