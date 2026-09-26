import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      default: "Inquiry from SkillStack LMS",
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    recipient: {
      type: String,
      default: "sandeeppal6926@gmail.com",
    },
    status: {
      type: String,
      enum: ["received", "delivered", "pending"],
      default: "received",
    },
  },
  { timestamps: true }
);

export const Contact = mongoose.model("Contact", contactSchema);
