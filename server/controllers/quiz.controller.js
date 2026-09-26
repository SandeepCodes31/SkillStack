import mongoose from "mongoose";
import { Quiz } from "../models/quiz.model.js";
import { QuizAttempt } from "../models/quizAttempt.model.js";
import { Course } from "../models/course.model.js";
import { CourseProgress } from "../models/courseProgress.js";
import { User } from "../models/user.model.js";
import { verifyCourseCompletion } from "../utils/completionService.js";
import { recordLearningActivity } from "../services/streak.service.js";

/**
 * Helper: Shuffle an array in-place using Fisher-Yates
 */
const shuffleArray = (array) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// ==========================================
// STUDENT CONTROLLERS
// ==========================================

/**
 * GET /api/v1/quiz/course/:courseId
 * Retrieves quiz information, student eligibility, progress, and past attempts summary.
 * NEVER exposes correct answers or question bank.
 */
export const getCourseQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.id;

    const course = await Course.findById(courseId).select("courseTitle lectures");
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    const quiz = await Quiz.findOne({ courseId, isPublished: true });
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "No published assessment available for this course yet.",
      });
    }

    // Calculate genuine lecture progress
    const totalLectures = course.lectures?.length || 0;
    const progressDoc = await CourseProgress.findOne({ userId: studentId, courseId });
    const viewedLectures = progressDoc?.lectureProgress?.filter((l) => l.viewed)?.length || 0;
    const progressPercentage = totalLectures > 0 ? Math.round((viewedLectures / totalLectures) * 100) : 100;
    const isUnlocked = progressPercentage >= 100;

    // Student attempts history
    const attempts = await QuizAttempt.find({ quizId: quiz._id, studentId }).sort({ createdAt: -1 });
    const attemptsCount = attempts.length;
    const attemptsRemaining = Math.max(0, quiz.maxAttempts - attemptsCount);
    const passedAttempt = attempts.find((a) => a.result === "passed");
    const isPassed = !!passedAttempt;
    const bestScore = attempts.reduce((max, a) => Math.max(max, a.percentage || 0), 0);

    return res.status(200).json({
      success: true,
      quiz: {
        _id: quiz._id,
        courseId: quiz.courseId,
        title: quiz.title,
        description: quiz.description,
        duration: quiz.duration,
        passingPercentage: quiz.passingPercentage,
        maxAttempts: quiz.maxAttempts,
        totalQuestions: quiz.questions?.length || 0,
      },
      eligibility: {
        isUnlocked,
        progressPercentage,
        viewedLectures,
        totalLectures,
        attemptsCount,
        attemptsRemaining,
        isPassed,
        bestScore,
        certificateId: progressDoc?.certificateId || null,
      },
      pastAttempts: attempts.map((a) => ({
        _id: a._id,
        attemptNumber: a.attemptNumber,
        percentage: a.percentage,
        result: a.result,
        status: a.status,
        submittedAt: a.submittedAt,
        timeTaken: a.timeTaken,
      })),
    });
  } catch (error) {
    console.error("getCourseQuiz error:", error);
    return res.status(500).json({ success: false, message: "Failed to load quiz." });
  }
};

/**
 * POST /api/v1/quiz/:quizId/start
 * Starts a new timed assessment attempt.
 * STRICT ENFORCEMENT: Rejects if courseProgress < 100% or attempts exhausted.
 */
export const startQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const studentId = req.id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz || !quiz.isPublished) {
      return res.status(404).json({ success: false, message: "Assessment not found or unpublished." });
    }

    const courseId = quiz.courseId;

    // 1. Enrollment validation
    const user = await User.findById(studentId);
    const isEnrolled = user?.enrolledCourses?.some(
      (id) => id.toString() === courseId.toString()
    );
    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to take the assessment.",
      });
    }

    // 2. Strict Course Progress validation (Must be 100%)
    const course = await Course.findById(courseId);
    const totalLectures = course.lectures?.length || 0;
    const progressDoc = await CourseProgress.findOne({ userId: studentId, courseId });
    const viewedLectures = progressDoc?.lectureProgress?.filter((l) => l.viewed)?.length || 0;
    const progressPercentage = totalLectures > 0 ? Math.round((viewedLectures / totalLectures) * 100) : 100;

    if (progressPercentage < 100) {
      return res.status(403).json({
        success: false,
        message: `Assessment is locked. You have completed ${progressPercentage}% of the course. You must complete 100% of the lessons before taking the final test.`,
        progressPercentage,
      });
    }

    // 3. Check for an active in-progress attempt within valid time
    const activeAttempt = await QuizAttempt.findOne({
      quizId,
      studentId,
      status: "in-progress",
    });

    if (activeAttempt) {
      const elapsedSeconds = Math.floor((Date.now() - new Date(activeAttempt.startedAt).getTime()) / 1000);
      const totalAllowedSeconds = quiz.duration * 60;

      if (elapsedSeconds <= totalAllowedSeconds + 30) {
        // Resume existing active attempt
        const selectedQuestions = quiz.questions.filter((q) =>
          activeAttempt.selectedQuestionIds.includes(q._id.toString())
        );

        const sanitizedQuestions = selectedQuestions.map((q) => ({
          _id: q._id,
          questionText: q.questionText,
          options: q.options.map((opt) => ({ optionId: opt.optionId, text: opt.text })),
          marks: q.marks,
        }));

        return res.status(200).json({
          success: true,
          isResumed: true,
          attempt: {
            _id: activeAttempt._id,
            attemptNumber: activeAttempt.attemptNumber,
            startedAt: activeAttempt.startedAt,
            allowedDurationSeconds: totalAllowedSeconds,
            remainingSeconds: Math.max(0, totalAllowedSeconds - elapsedSeconds),
            totalQuestions: sanitizedQuestions.length,
            passingPercentage: quiz.passingPercentage,
            quizTitle: quiz.title,
            courseId: quiz.courseId,
          },
          questions: sanitizedQuestions,
        });
      } else {
        // Expired in-progress attempt: close it as auto-submitted
        activeAttempt.status = "auto-submitted";
        activeAttempt.result = "failed";
        activeAttempt.submittedAt = new Date(new Date(activeAttempt.startedAt).getTime() + totalAllowedSeconds * 1000);
        await activeAttempt.save();
      }
    }

    // 4. Attempt limits validation
    const completedAttemptsCount = await QuizAttempt.countDocuments({
      quizId,
      studentId,
      status: { $in: ["submitted", "auto-submitted"] },
    });

    if (completedAttemptsCount >= quiz.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: `You have used all ${quiz.maxAttempts} allowed attempts for this assessment.`,
        maxAttemptsReached: true,
      });
    }

    // 5. Select questions (Randomize if configured)
    let questionsPool = [...quiz.questions];
    if (questionsPool.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No questions configured in this assessment.",
      });
    }

    if (quiz.randomizeQuestions) {
      questionsPool = shuffleArray(questionsPool);
    }

    const selectedQuestions = questionsPool;
    const selectedQuestionIds = selectedQuestions.map((q) => q._id.toString());

    // 6. Create new QuizAttempt record
    const newAttempt = await QuizAttempt.create({
      quizId,
      courseId,
      studentId,
      attemptNumber: completedAttemptsCount + 1,
      selectedQuestionIds,
      answers: [],
      totalQuestions: selectedQuestions.length,
      passingPercentage: quiz.passingPercentage,
      status: "in-progress",
      startedAt: new Date(),
    });

    // 7. Sanitize questions (Remove correctOptionId and explanation!)
    const sanitizedQuestions = selectedQuestions.map((q) => {
      let options = q.options.map((opt) => ({ optionId: opt.optionId, text: opt.text }));
      if (quiz.randomizeOptions) {
        options = shuffleArray(options);
      }
      return {
        _id: q._id,
        questionText: q.questionText,
        options,
        marks: q.marks,
      };
    });

    return res.status(201).json({
      success: true,
      isResumed: false,
      attempt: {
        _id: newAttempt._id,
        attemptNumber: newAttempt.attemptNumber,
        startedAt: newAttempt.startedAt,
        allowedDurationSeconds: quiz.duration * 60,
        remainingSeconds: quiz.duration * 60,
        totalQuestions: sanitizedQuestions.length,
        passingPercentage: quiz.passingPercentage,
        quizTitle: quiz.title,
        courseId: quiz.courseId,
      },
      questions: sanitizedQuestions,
    });
  } catch (error) {
    console.error("startQuiz error:", error);
    return res.status(500).json({ success: false, message: "Failed to start quiz." });
  }
};

/**
 * POST /api/v1/quiz/:quizId/submit
 * Submits student answers, executes server-side evaluation, determines pass/fail,
 * and triggers certificate generation if passed.
 */
export const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const studentId = req.id;
    const { attemptId, answers = [] } = req.body;

    if (!attemptId || !mongoose.Types.ObjectId.isValid(attemptId) || !mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ success: false, message: "Valid Attempt ID and Assessment ID are required." });
    }

    const attempt = await QuizAttempt.findOne({ _id: attemptId, quizId, studentId });
    if (!attempt) {
      return res.status(404).json({ success: false, message: "Assessment attempt not found." });
    }

    if (attempt.status !== "in-progress") {
      return res.status(400).json({
        success: false,
        message: "This assessment attempt has already been submitted.",
      });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found." });
    }

    // Server-Side Anti-Cheat Elapsed Time Check
    const elapsedSeconds = Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000);
    const totalAllowedSeconds = quiz.duration * 60;
    const isAutoSubmitted = elapsedSeconds > totalAllowedSeconds + 60; // 60s network grace period

    // Build question lookup map from DB
    const questionsMap = new Map();
    quiz.questions.forEach((q) => {
      questionsMap.set(q._id.toString(), q);
    });

    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unansweredQuestions = 0;
    let totalMarks = 0;
    let obtainedMarks = 0;

    const evaluatedAnswers = [];

    // Evaluate answers strictly against stored question bank
    for (const qId of attempt.selectedQuestionIds) {
      const question = questionsMap.get(qId);
      if (!question) continue;

      totalMarks += question.marks || 1;

      const studentAnswer = answers.find(
        (a) => a.questionId?.toString() === qId.toString()
      );

      const selectedOptionId = studentAnswer?.selectedOptionId || null;

      if (!selectedOptionId) {
        unansweredQuestions++;
        evaluatedAnswers.push({
          questionId: qId,
          selectedOptionId: null,
          isCorrect: false,
          marksObtained: 0,
        });
      } else if (selectedOptionId === question.correctOptionId) {
        correctAnswers++;
        obtainedMarks += question.marks || 1;
        evaluatedAnswers.push({
          questionId: qId,
          selectedOptionId,
          isCorrect: true,
          marksObtained: question.marks || 1,
        });
      } else {
        incorrectAnswers++;
        evaluatedAnswers.push({
          questionId: qId,
          selectedOptionId,
          isCorrect: false,
          marksObtained: 0,
        });
      }
    }

    const totalQuestions = attempt.selectedQuestionIds.length;
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const result = percentage >= quiz.passingPercentage ? "passed" : "failed";

    // Update Attempt Document
    attempt.answers = evaluatedAnswers;
    attempt.totalQuestions = totalQuestions;
    attempt.correctAnswers = correctAnswers;
    attempt.incorrectAnswers = incorrectAnswers;
    attempt.unansweredQuestions = unansweredQuestions;
    attempt.totalMarks = totalMarks;
    attempt.obtainedMarks = obtainedMarks;
    attempt.percentage = percentage;
    attempt.result = result;
    attempt.status = isAutoSubmitted ? "auto-submitted" : "submitted";
    attempt.submittedAt = new Date();
    attempt.timeTaken = Math.min(elapsedSeconds, totalAllowedSeconds);

    await attempt.save();

    // Record learning activity and update student streak
    const timezone = req.headers["x-timezone"] || req.query.timezone || "Asia/Kolkata";
    let streakResult = null;
    try {
      streakResult = await recordLearningActivity(studentId, {
        activityType: result === "passed" ? "ASSESSMENT_COMPLETED" : "QUIZ_COMPLETED",
        courseId: quiz.courseId,
        quizId: quiz._id,
        metadata: {
          quizTitle: quiz.title,
          score: percentage,
          result,
        },
        timezone,
      });
    } catch (streakErr) {
      console.error("Streak update error in submitQuiz:", streakErr);
    }

    // Trigger Course Completion & Certificate if Passed
    let certificate = null;
    let completionMessage = null;

    if (result === "passed") {
      const completionResult = await verifyCourseCompletion(studentId, quiz.courseId, attempt._id);
      if (completionResult.success) {
        certificate = completionResult.certificate;
        completionMessage = completionResult.message;
      }
    }

    return res.status(200).json({
      success: true,
      message: result === "passed" ? "Congratulations! You passed the assessment!" : "Assessment not passed.",
      summary: {
        attemptId: attempt._id,
        attemptNumber: attempt.attemptNumber,
        totalQuestions,
        correctAnswers,
        incorrectAnswers,
        unansweredQuestions,
        obtainedMarks,
        totalMarks,
        percentage,
        passingPercentage: quiz.passingPercentage,
        result,
        status: attempt.status,
        timeTaken: attempt.timeTaken,
        isAutoSubmitted,
      },
      certificate,
      completionMessage,
      streak: streakResult,
    });
  } catch (error) {
    console.error("submitQuiz error:", error);
    return res.status(500).json({ success: false, message: "Failed to submit assessment." });
  }
};

/**
 * GET /api/v1/quiz/attempt/:attemptId
 * Retrieves full attempt review with questions, student answers, correct answers, and explanations.
 * Only accessible after submission!
 */
export const getAttemptResult = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const studentId = req.id;

    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ success: false, message: "Attempt not found." });
    }

    // Security: Student owns the attempt or is Admin
    if (attempt.studentId.toString() !== studentId.toString() && req.role !== "admin" && req.role !== "instructor") {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    if (attempt.status === "in-progress") {
      return res.status(400).json({
        success: false,
        message: "Results and answers are only accessible after exam submission.",
      });
    }

    const quiz = await Quiz.findById(attempt.quizId);
    const questionsMap = new Map();
    quiz?.questions?.forEach((q) => questionsMap.set(q._id.toString(), q));

    // Construct detailed question-by-question review
    const review = attempt.selectedQuestionIds.map((qId, idx) => {
      const originalQ = questionsMap.get(qId);
      const studentAns = attempt.answers.find((a) => a.questionId === qId);

      return {
        questionIndex: idx + 1,
        questionId: qId,
        questionText: originalQ?.questionText || "Question",
        options: originalQ?.options || [],
        selectedOptionId: studentAns?.selectedOptionId || null,
        correctOptionId: originalQ?.correctOptionId || null,
        isCorrect: !!studentAns?.isCorrect,
        explanation: originalQ?.explanation || "No explanation provided.",
        marks: originalQ?.marks || 1,
      };
    });

    return res.status(200).json({
      success: true,
      summary: {
        attemptId: attempt._id,
        attemptNumber: attempt.attemptNumber,
        quizTitle: quiz?.title || "Assessment",
        courseId: attempt.courseId,
        totalQuestions: attempt.totalQuestions,
        correctAnswers: attempt.correctAnswers,
        incorrectAnswers: attempt.incorrectAnswers,
        unansweredQuestions: attempt.unansweredQuestions,
        percentage: attempt.percentage,
        passingPercentage: attempt.passingPercentage,
        result: attempt.result,
        status: attempt.status,
        timeTaken: attempt.timeTaken,
        submittedAt: attempt.submittedAt,
      },
      review,
    });
  } catch (error) {
    console.error("getAttemptResult error:", error);
    return res.status(500).json({ success: false, message: "Failed to load attempt result." });
  }
};

/**
 * GET /api/v1/quiz/my-attempts/:courseId
 * Lists all attempts made by the student for a course.
 */
export const getMyAttempts = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.id;

    const attempts = await QuizAttempt.find({ courseId, studentId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      attempts: attempts.map((a) => ({
        _id: a._id,
        attemptNumber: a.attemptNumber,
        percentage: a.percentage,
        result: a.result,
        status: a.status,
        correctAnswers: a.correctAnswers,
        totalQuestions: a.totalQuestions,
        timeTaken: a.timeTaken,
        submittedAt: a.submittedAt,
      })),
    });
  } catch (error) {
    console.error("getMyAttempts error:", error);
    return res.status(500).json({ success: false, message: "Failed to load attempt history." });
  }
};

// ==========================================
// ADMIN CONTROLLERS
// ==========================================

export const getAllAdminQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate("courseId", "courseTitle courseThumbnail category")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      quizzes: quizzes.map((q) => ({
        _id: q._id,
        title: q.title,
        description: q.description,
        courseId: q.courseId?._id,
        courseTitle: q.courseId?.courseTitle || "Unknown Course",
        category: q.courseId?.category || "General",
        questionsCount: q.questions?.length || 0,
        duration: q.duration,
        passingPercentage: q.passingPercentage,
        maxAttempts: q.maxAttempts,
        isPublished: q.isPublished,
        createdAt: q.createdAt,
      })),
    });
  } catch (error) {
    console.error("getAllAdminQuizzes error:", error);
    return res.status(500).json({ success: false, message: "Failed to load admin quizzes." });
  }
};

export const createQuiz = async (req, res) => {
  try {
    const {
      courseId,
      title,
      description,
      duration = 20,
      passingPercentage = 60,
      maxAttempts = 3,
      randomizeQuestions = true,
      randomizeOptions = false,
      isPublished = true,
    } = req.body;

    if (!courseId || !title || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Course ID and Assessment Title are required.",
      });
    }

    const existingQuiz = await Quiz.findOne({ courseId });
    if (existingQuiz) {
      return res.status(400).json({
        success: false,
        message: "An assessment already exists for this course. Please edit the existing one.",
      });
    }

    const quiz = await Quiz.create({
      courseId,
      title,
      description,
      duration: Number(duration),
      passingPercentage: Number(passingPercentage),
      maxAttempts: Number(maxAttempts),
      randomizeQuestions: Boolean(randomizeQuestions),
      randomizeOptions: Boolean(randomizeOptions),
      isPublished: Boolean(isPublished),
      createdBy: req.id,
      questions: [],
    });

    return res.status(201).json({
      success: true,
      message: "Assessment created successfully.",
      quiz,
    });
  } catch (error) {
    console.error("createQuiz error:", error);
    return res.status(500).json({ success: false, message: "Failed to create assessment." });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    if (!quizId || !mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ success: false, message: "Valid Assessment ID is required." });
    }
    const updateData = req.body;

    const quiz = await Quiz.findByIdAndUpdate(quizId, updateData, { new: true });
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Assessment not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Assessment updated successfully.",
      quiz,
    });
  } catch (error) {
    console.error("updateQuiz error:", error);
    return res.status(500).json({ success: false, message: "Failed to update assessment." });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findByIdAndDelete(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Assessment not found." });
    }

    // Also remove associated attempts
    await QuizAttempt.deleteMany({ quizId });

    return res.status(200).json({
      success: true,
      message: "Assessment and related records deleted successfully.",
    });
  } catch (error) {
    console.error("deleteQuiz error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete assessment." });
  }
};

export const addQuestion = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { questionText, options, correctOptionId, explanation = "", marks = 1 } = req.body;

    if (!questionText || !options || options.length < 2 || !correctOptionId) {
      return res.status(400).json({
        success: false,
        message: "Question text, at least 2 options, and the correct answer are required.",
      });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Assessment not found." });
    }

    quiz.questions.push({
      questionText,
      options,
      correctOptionId,
      explanation,
      marks: Number(marks),
    });

    await quiz.save();

    return res.status(201).json({
      success: true,
      message: "Question added successfully.",
      questionsCount: quiz.questions.length,
      questions: quiz.questions,
    });
  } catch (error) {
    console.error("addQuestion error:", error);
    return res.status(500).json({ success: false, message: "Failed to add question." });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { quizId, questionId } = req.params;
    const { questionText, options, correctOptionId, explanation, marks } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Assessment not found." });
    }

    const q = quiz.questions.id(questionId);
    if (!q) {
      return res.status(404).json({ success: false, message: "Question not found." });
    }

    if (questionText) q.questionText = questionText;
    if (options) q.options = options;
    if (correctOptionId) q.correctOptionId = correctOptionId;
    if (explanation !== undefined) q.explanation = explanation;
    if (marks !== undefined) q.marks = Number(marks);

    await quiz.save();

    return res.status(200).json({
      success: true,
      message: "Question updated successfully.",
      questions: quiz.questions,
    });
  } catch (error) {
    console.error("updateQuestion error:", error);
    return res.status(500).json({ success: false, message: "Failed to update question." });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { quizId, questionId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Assessment not found." });
    }

    quiz.questions.pull({ _id: questionId });
    await quiz.save();

    return res.status(200).json({
      success: true,
      message: "Question removed successfully.",
      questionsCount: quiz.questions.length,
      questions: quiz.questions,
    });
  } catch (error) {
    console.error("deleteQuestion error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete question." });
  }
};

export const getQuizAnalytics = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId).populate("courseId", "courseTitle");
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Assessment not found." });
    }

    const attempts = await QuizAttempt.find({ quizId, status: { $in: ["submitted", "auto-submitted"] } });

    const totalAttempts = attempts.length;
    const uniqueStudents = new Set(attempts.map((a) => a.studentId.toString())).size;
    const passedAttempts = attempts.filter((a) => a.result === "passed").length;
    const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

    const scores = attempts.map((a) => a.percentage || 0);
    const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

    return res.status(200).json({
      success: true,
      analytics: {
        quizTitle: quiz.title,
        courseTitle: quiz.courseId?.courseTitle,
        totalQuestions: quiz.questions?.length || 0,
        totalAttempts,
        uniqueStudents,
        passRate,
        averageScore,
        highestScore,
        lowestScore,
      },
    });
  } catch (error) {
    console.error("getQuizAnalytics error:", error);
    return res.status(500).json({ success: false, message: "Failed to load quiz analytics." });
  }
};
