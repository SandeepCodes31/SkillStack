import dotenv from "dotenv";
import mongoose from "mongoose";
import { Badge } from "../models/badge.model.js";

dotenv.config({});

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lms";

const defaultBadges = [
  {
    badgeId: "STREAK_3",
    name: "3-Day Starter",
    description: "Completed 3 consecutive learning days.",
    icon: "🔥",
    category: "STREAK",
    requirementType: "STREAK_DAYS",
    requirementValue: 3,
    tier: "starter",
  },
  {
    badgeId: "STREAK_7",
    name: "7-Day Learner",
    description: "Maintained a 7-day learning streak.",
    icon: "🥉",
    category: "STREAK",
    requirementType: "STREAK_DAYS",
    requirementValue: 7,
    tier: "bronze",
  },
  {
    badgeId: "STREAK_14",
    name: "14-Day Consistent",
    description: "Maintained a 2-week consecutive learning streak.",
    icon: "⚡",
    category: "STREAK",
    requirementType: "STREAK_DAYS",
    requirementValue: 14,
    tier: "bronze",
  },
  {
    badgeId: "STREAK_30",
    name: "30-Day Learner",
    description: "Maintained a 30-day learning streak.",
    icon: "🥈",
    category: "STREAK",
    requirementType: "STREAK_DAYS",
    requirementValue: 30,
    tier: "silver",
  },
  {
    badgeId: "STREAK_50",
    name: "50-Day Dedicated",
    description: "Completed 50 consecutive learning days.",
    icon: "🌟",
    category: "STREAK",
    requirementType: "STREAK_DAYS",
    requirementValue: 50,
    tier: "silver",
  },
  {
    badgeId: "STREAK_100",
    name: "100-Day Centurion",
    description: "Maintained a 100-day learning streak.",
    icon: "🥇",
    category: "STREAK",
    requirementType: "STREAK_DAYS",
    requirementValue: 100,
    tier: "gold",
  },
  {
    badgeId: "STREAK_365",
    name: "365-Day Master",
    description: "Achieved a full year of daily learning.",
    icon: "👑",
    category: "STREAK",
    requirementType: "STREAK_DAYS",
    requirementValue: 365,
    tier: "master",
  },
];

export const seedBadges = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGO_URI);
      console.log("Connected to MongoDB for badge seeding.");
    }

    for (const b of defaultBadges) {
      await Badge.findOneAndUpdate(
        { badgeId: b.badgeId },
        { $set: b },
        { upsert: true, new: true }
      );
    }

    const count = await Badge.countDocuments();
    console.log(`Badges successfully seeded. Total badges in DB: ${count}`);
  } catch (error) {
    console.error("seedBadges error:", error);
  }
};

// If run directly from CLI
if (process.argv[1]?.endsWith("seedBadges.js")) {
  seedBadges().then(() => {
    mongoose.disconnect();
    process.exit(0);
  });
}
