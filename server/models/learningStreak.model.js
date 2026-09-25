import mongoose from "mongoose";

const learningStreakSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastActivityDate: {
      type: String, // Stored as "YYYY-MM-DD"
      default: null,
    },
    streakStartDate: {
      type: String, // Stored as "YYYY-MM-DD"
      default: null,
    },
    totalLearningDays: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

export const LearningStreak = mongoose.model("LearningStreak", learningStreakSchema);
