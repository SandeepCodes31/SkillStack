import mongoose from "mongoose";

const learningActivitySchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    activityType: {
      type: String,
      enum: [
        "LESSON_COMPLETED",
        "MODULE_COMPLETED",
        "QUIZ_COMPLETED",
        "ASSESSMENT_COMPLETED",
        "COURSE_PROGRESS",
        "COURSE_COMPLETED",
        "CERTIFICATE_EARNED",
      ],
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    lessonId: {
      type: String,
      default: null,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      default: null,
    },
    date: {
      type: String, // "YYYY-MM-DD" in student's timezone
      required: true,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

// Compound index for fast query performance and activity aggregation
learningActivitySchema.index({ studentId: 1, date: 1 });

export const LearningActivity = mongoose.model("LearningActivity", learningActivitySchema);
