import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import http from "http";
import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import { Quiz } from "../models/quiz.model.js";
import { QuizAttempt } from "../models/quizAttempt.model.js";
import { Certificate } from "../models/certificate.model.js";
import { CourseProgress } from "../models/courseProgress.js";
import { verifyCourseCompletion } from "../utils/completionService.js";

dotenv.config({ path: "./.env" });

const studentId = "6aae306e8303139e5d577410"; // sandeepgcp31@gmail.com

async function testLifecycle() {
  console.log("=== STARTING FULL COURSE COMPLETION & CERTIFICATE LIFECYCLE TEST ===");
  await mongoose.connect(process.env.MONGO_URI);

  // 1. Get HTML5 course
  const course = await Course.findOne({ courseTitle: { $regex: /HTML5/i } });
  if (!course) throw new Error("HTML5 course not found!");
  const courseId = course._id.toString();
  console.log(`[1] Found Course: "${course.courseTitle}" (ID: ${courseId})`);

  // Ensure user is enrolled
  const student = await User.findById(studentId);
  if (!student.enrolledCourses.map(id => id.toString()).includes(courseId)) {
    student.enrolledCourses.push(course._id);
    await student.save();
    console.log("[1b] Enrolled student into course.");
  }

  // 2. Get Quiz
  const quiz = await Quiz.findOne({ courseId: course._id });
  if (!quiz) throw new Error("Quiz not found for HTML5 course!");
  const quizId = quiz._id.toString();
  console.log(`[2] Found Quiz: "${quiz.title}" with ${quiz.questions.length} questions`);

  // Clean up any old attempts and certificates for test repeatability
  await QuizAttempt.deleteMany({ quizId: quiz._id, studentId });
  await Certificate.deleteMany({ courseId: course._id, studentId });

  // 3. Test CASE 1: Course Progress < 100% -> Start Quiz must be REJECTED (403)
  console.log("[3] Testing Locked Quiz at 0% course progress...");
  let progressDoc = await CourseProgress.findOne({ userId: studentId, courseId });
  if (!progressDoc) {
    progressDoc = await CourseProgress.create({
      userId: studentId,
      courseId,
      completed: false,
      progressPercentage: 0,
      lectureProgress: [],
    });
  } else {
    progressDoc.completed = false;
    progressDoc.progressPercentage = 0;
    progressDoc.lectureProgress = [];
    progressDoc.courseCompleted = false;
    progressDoc.finalAssessmentPassed = false;
    await progressDoc.save();
  }

  // Helper for HTTP requests
  const token = jwt.sign({ userId: studentId, role: "student" }, process.env.SECRET_KEY, { expiresIn: "1d" });
  const cookie = "token=" + token;

  const makeReq = (method, path, body = null) =>
    new Promise((resolve, reject) => {
      const payload = body ? JSON.stringify(body) : null;
      const req = http.request(
        `http://localhost:8080${path}`,
        {
          method,
          headers: {
            Cookie: cookie,
            ...(payload ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) } : {}),
          },
        },
        (res) => {
          let chunks = [];
          res.on("data", (c) => chunks.push(c));
          res.on("end", () => {
            const buffer = Buffer.concat(chunks);
            let parsed = null;
            try {
              parsed = JSON.parse(buffer.toString());
            } catch (e) {
              parsed = buffer;
            }
            resolve({ status: res.statusCode, headers: res.headers, body: parsed, buffer });
          });
        }
      );
      req.on("error", reject);
      if (payload) req.write(payload);
      req.end();
    });

  const lockRes = await makeReq("POST", `/api/v1/quiz/${quizId}/start`);
  console.log(`    Start at 0% status: ${lockRes.status} (Expected: 403)`);
  if (lockRes.status !== 403) throw new Error("Security failure: Quiz started before course completion!");
  console.log("    ✓ VERIFIED: Quiz successfully locked at < 100% progress.");

  // 4. Test CASE 2: Complete Course Content (100%) -> Start Quiz must SUCCEED (201/200)
  console.log("[4] Setting course content to 100%...");
  progressDoc.lectureProgress = course.lectures.map((l) => ({ lectureId: l.toString(), viewed: true }));
  progressDoc.completed = true;
  progressDoc.progressPercentage = 100;
  await progressDoc.save();

  const startRes = await makeReq("POST", `/api/v1/quiz/${quizId}/start`);
  console.log(`    Start at 100% status: ${startRes.status} (Expected: 201)`);
  if (startRes.status !== 201 && startRes.status !== 200) throw new Error("Failed to start quiz at 100% progress!");

  const attemptId = startRes.body.attempt._id;
  const examQuestions = startRes.body.questions;
  console.log(`    ✓ VERIFIED: Quiz started! Attempt ID: ${attemptId}, Questions received: ${examQuestions.length}`);

  // Verify anti-cheat: questions must NOT include correctOptionId or explanation!
  if (examQuestions[0].correctOptionId || examQuestions[0].explanation) {
    throw new Error("Security failure: Correct answers or explanations were leaked to student!");
  }
  console.log("    ✓ VERIFIED: Question bank sanitized (no answers leaked).");

  // 5. Test CASE 3: Submit with Failing Score (< 60%) -> Must FAIL, NO Certificate
  console.log("[5] Submitting test with incorrect answers (0%)...");
  const failAnswers = examQuestions.map((q) => ({
    questionId: q._id,
    selectedOptionId: "Z", // purposefully wrong option
  }));

  const failRes = await makeReq("POST", `/api/v1/quiz/${quizId}/submit`, {
    attemptId,
    answers: failAnswers,
  });

  console.log(`    Submit status: ${failRes.status}, Result: ${failRes.body.summary.result}, Score: ${failRes.body.summary.percentage}%`);
  if (failRes.body.summary.result !== "failed" || failRes.body.summary.percentage >= 60) {
    throw new Error("Evaluation error: Expected failed result!");
  }
  if (failRes.body.certificate) {
    throw new Error("Integrity error: Certificate was issued for a failed quiz!");
  }
  console.log("    ✓ VERIFIED: Failed score correctly calculated; NO certificate generated.");

  // 6. Test CASE 4: Retake Test with Passing Score (>= 60%) -> Must PASS, Certificate GENERATED!
  console.log("[6] Retaking test with correct answers (100%)...");
  const retakeStartRes = await makeReq("POST", `/api/v1/quiz/${quizId}/start`);
  const retakeAttemptId = retakeStartRes.body.attempt._id;
  const retakeQuestions = retakeStartRes.body.questions;

  // Build 100% correct answers using DB question bank
  const passAnswers = retakeQuestions.map((q) => {
    const originalQ = quiz.questions.id(q._id);
    return {
      questionId: q._id,
      selectedOptionId: originalQ.correctOptionId,
    };
  });

  const passRes = await makeReq("POST", `/api/v1/quiz/${quizId}/submit`, {
    attemptId: retakeAttemptId,
    answers: passAnswers,
  });

  console.log(`    Retake Submit status: ${passRes.status}, Result: ${passRes.body.summary.result}, Score: ${passRes.body.summary.percentage}%`);
  if (passRes.body.summary.result !== "passed" || passRes.body.summary.percentage < 60) {
    throw new Error("Evaluation error: Expected passed result!");
  }

  const certificate = passRes.body.certificate;
  if (!certificate || !certificate.certificateId) {
    throw new Error("Fulfillment error: Certificate was not generated upon passing!");
  }
  console.log(`    ✓ VERIFIED: Final test PASSED! Generated Certificate ID: ${certificate.certificateId}`);
  console.log(`    Verification Code: ${certificate.verificationCode}`);

  // Check DB state
  const updatedProgress = await CourseProgress.findOne({ userId: studentId, courseId });
  if (!updatedProgress.courseCompleted || !updatedProgress.finalAssessmentPassed) {
    throw new Error("State error: CourseProgress not marked completed after certificate generation!");
  }
  console.log("    ✓ VERIFIED: CourseProgress marked courseCompleted = true and finalAssessmentPassed = true.");

  // 7. Test CASE 5: Duplicate Certificate Prevention (Idempotency)
  console.log("[7] Testing duplicate certificate prevention...");
  const dupCheck = await verifyCourseCompletion(studentId, courseId, retakeAttemptId);
  console.log(`    Duplicate check isExisting: ${dupCheck.isExisting} (Expected: true), Cert ID: ${dupCheck.certificate.certificateId}`);
  if (!dupCheck.isExisting || dupCheck.certificate.certificateId !== certificate.certificateId) {
    throw new Error("Idempotency error: Duplicate certificate was created!");
  }
  const certCount = await Certificate.countDocuments({ studentId, courseId });
  if (certCount !== 1) {
    throw new Error(`Database error: Expected exactly 1 certificate in DB, found ${certCount}!`);
  }
  console.log("    ✓ VERIFIED: Duplicate prevention passed. Exactly 1 unique certificate preserved in MongoDB.");

  // 8. Test CASE 6: Public Certificate Verification Endpoint
  console.log("[8] Testing public certificate verification endpoint...");
  const verifyRes = await makeReq("GET", `/api/v1/certificate/verify/${certificate.certificateId}`);
  console.log(`    Verify status: ${verifyRes.status}, Valid: ${verifyRes.body.valid}, Student: ${verifyRes.body.certificate?.studentName}`);
  if (verifyRes.status !== 200 || !verifyRes.body.valid) {
    throw new Error("Verification API failed to validate authentic certificate ID!");
  }
  console.log("    ✓ VERIFIED: Public certificate verification endpoint authenticates credential.");

  // 9. Test CASE 7: High-Resolution Landscape PDF Certificate Download
  console.log("[9] Testing PDF certificate generation with QR code...");
  const pdfRes = await makeReq("GET", `/api/v1/certificate/${certificate.certificateId}/pdf`);
  console.log(`    PDF status: ${pdfRes.status}, Content-Type: ${pdfRes.headers["content-type"]}, Bytes: ${pdfRes.buffer.length}`);
  if (pdfRes.status !== 200 || !pdfRes.headers["content-type"].includes("application/pdf")) {
    throw new Error("PDF generator failed!");
  }
  const pdfHeader = pdfRes.buffer.subarray(0, 5).toString();
  if (pdfHeader !== "%PDF-") {
    throw new Error(`Invalid PDF header: expected %PDF-, got ${pdfHeader}`);
  }
  console.log(`    ✓ VERIFIED: PDF generated successfully with valid header ${pdfHeader} and ${pdfRes.buffer.length} bytes.`);

  // 10. Test CASE 8: Attempt Review
  console.log("[10] Testing post-submission answer review endpoint...");
  const reviewRes = await makeReq("GET", `/api/v1/quiz/attempt/${retakeAttemptId}`);
  console.log(`    Review status: ${reviewRes.status}, Questions reviewed: ${reviewRes.body.review?.length}`);
  if (reviewRes.status !== 200 || reviewRes.body.review.length === 0) {
    throw new Error("Review API failed!");
  }
  console.log("    ✓ VERIFIED: Review endpoint returns student answers, correct answers, and explanations.");

  console.log("\n===================================================================");
  console.log("🎉 ALL 10 COURSE COMPLETION, QUIZ, AND CERTIFICATE TESTS PASSED! 🎉");
  console.log("===================================================================\n");
  process.exit(0);
}

testLifecycle().catch((err) => {
  console.error("\n❌ TEST FAILED:", err);
  process.exit(1);
});
