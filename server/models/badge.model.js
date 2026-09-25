import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema(
  {
    badgeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String, // Emoji or SVG identifier, e.g. "🥉", "🥈", "🥇"
      required: true,
    },
    category: {
      type: String,
      enum: ["STREAK", "COURSE", "QUIZ", "ACHIEVEMENT"],
      default: "STREAK",
    },
    requirementType: {
      type: String,
      enum: ["STREAK_DAYS", "COURSES_COMPLETED", "QUIZZES_PASSED"],
      default: "STREAK_DAYS",
    },
    requirementValue: {
      type: Number,
      required: true,
    },
    tier: {
      type: String,
      enum: ["starter", "bronze", "silver", "gold", "master"],
      default: "bronze",
    },
  },
  { timestamps: true }
);

export const Badge = mongoose.model("Badge", badgeSchema);
