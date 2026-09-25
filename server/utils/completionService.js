import crypto from "crypto";
import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import { CourseProgress } from "../models/courseProgress.js";
import { QuizAttempt } from "../models/quizAttempt.model.js";
import { Certificate } from "../models/certificate.model.js";
import { recordLearningActivity } from "../services/streak.service.js";

/**
 * Generates a human-friendly unique Certificate ID
 * Example: SKILL-2026-8F42A91C
 */
export const generateCertificateId = () => {
  const year = new Date().getFullYear();
  const randomHex = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `SKILL-${year}-${randomHex}`;
};

/**
 * Generates a secure verification code
 * Example: VCD-A1B2C3D4E5F6
 */
export const generateVerificationCode = () => {
  return `VCD-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
};

/**
 * Centralized Course Completion Verification & Certificate Issuance Engine
 * Verifies all criteria:
 * 1. Student exists and is enrolled.
 * 2. Course exists and has lectures.
 * 3. 100% of course content is completed (all lectures viewed).
 * 4. Final assessment passed with score >= passingPercentage.
 * 5. Returns existing certificate if already issued (no duplicates).
 */
export const verifyCourseCompletion = async (studentId, courseId, quizAttemptId) => {
  try {
    // 1. Verify student
    const student = await User.findById(studentId);
    if (!student) {
      return { success: false, status: 404, message: "Student record not found." };
    }

    const isEnrolled = student.enrolledCourses.some(
      (id) => id.toString() === courseId.toString()
    );
    if (!isEnrolled) {
      return { success: false, status: 403, message: "Student is not enrolled in this course." };
    }

    // 2. Verify course
    const course = await Course.findById(courseId).populate("creator", "name");
    if (!course) {
      return { success: false, status: 404, message: "Course not found." };
    }

    // 3. Verify Course Progress is 100%
    const totalLectures = course.lectures?.length || 0;
    const progressDoc = await CourseProgress.findOne({ userId: studentId, courseId });

    if (!progressDoc) {
      return {
        success: false,
        status: 400,
        message: "Course content must be 100% completed before final certificate issuance.",
      };
    }

    const viewedLectures = progressDoc.lectureProgress?.filter((l) => l.viewed)?.length || 0;
    const progressPercentage = totalLectures > 0 ? Math.round((viewedLectures / totalLectures) * 100) : 100;

    if (progressPercentage < 100) {
      return {
        success: false,
        status: 400,
        message: `Course is only ${progressPercentage}% completed. All lessons must be finished.`,
        progressPercentage,
      };
    }

    // 4. Verify Quiz Attempt
    let attempt = null;
    if (quizAttemptId) {
      attempt = await QuizAttempt.findOne({
        _id: quizAttemptId,
        studentId,
        courseId,
      });
    } else {
      // Find the highest passing attempt
      attempt = await QuizAttempt.findOne({
        studentId,
        courseId,
        result: "passed",
      }).sort({ percentage: -1, createdAt: -1 });
    }

    if (!attempt || attempt.result !== "passed") {
      return {
        success: false,
        status: 400,
        message: "Final assessment must be passed with >= 60% before certificate generation.",
      };
    }

    // 5. Check if certificate already exists (Idempotent / No Duplicates)
    let existingCertificate = await Certificate.findOne({
      studentId,
      courseId,
    });

    if (existingCertificate) {
      // Ensure courseProgress is in sync
      progressDoc.completed = true;
      progressDoc.progressPercentage = 100;
      progressDoc.courseCompleted = true;
      progressDoc.finalAssessmentPassed = true;
      progressDoc.finalAssessmentScore = Math.max(progressDoc.finalAssessmentScore || 0, attempt.percentage);
      progressDoc.certificateId = existingCertificate.certificateId;
      await progressDoc.save();

      return {
        success: true,
        status: 200,
        isExisting: true,
        certificate: existingCertificate,
        message: "Certificate is already issued for this course.",
      };
    }

    // 6. Generate New Certificate
    const certificateId = generateCertificateId();
    const verificationCode = generateVerificationCode();
    const instructorName = course.creator?.name || "SkillStack Faculty";

    const newCertificate = await Certificate.create({
      certificateId,
      studentId,
      courseId,
      quizAttemptId: attempt._id,
      studentName: student.name,
      courseName: course.courseTitle,
      instructorName,
      issueDate: new Date(),
      completionDate: attempt.submittedAt || new Date(),
      finalScore: attempt.percentage,
      verificationCode,
    });

    // 7. Atomically update CourseProgress record
    progressDoc.completed = true;
    progressDoc.progressPercentage = 100;
    progressDoc.courseCompleted = true;
    progressDoc.finalAssessmentPassed = true;
    progressDoc.finalAssessmentScore = attempt.percentage;
    progressDoc.completedAt = new Date();
    progressDoc.certificateId = newCertificate.certificateId;
    await progressDoc.save();

    // Record certificate completion learning activity
    try {
      await recordLearningActivity(studentId, {
        activityType: "CERTIFICATE_EARNED",
        courseId,
        metadata: {
          courseTitle: course.courseTitle,
          certificateId: newCertificate.certificateId,
          score: attempt.percentage,
        },
      });
    } catch (streakErr) {
      console.error("Streak update error in verifyCourseCompletion:", streakErr);
    }

    return {
      success: true,
      status: 201,
      isExisting: false,
      certificate: newCertificate,
      message: "Congratulations! Course requirements verified and certificate generated.",
    };
  } catch (error) {
    console.error("verifyCourseCompletion Error:", error);
    return {
      success: false,
      status: 500,
      message: "Internal server error while verifying course completion.",
      error: error.message,
    };
  }
};
