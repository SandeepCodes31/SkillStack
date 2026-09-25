import mongoose from "mongoose";

const studentBadgeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    badgeId: {
      type: String,
      required: true,
    },
    badge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Badge",
      required: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
    currentStreakWhenEarned: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Compound unique index: guarantees no duplicate badge per student
studentBadgeSchema.index({ studentId: 1, badgeId: 1 }, { unique: true });

export const StudentBadge = mongoose.model("StudentBadge", studentBadgeSchema);
