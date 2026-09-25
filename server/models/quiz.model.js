import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  optionId: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
});

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: [optionSchema],
  correctOptionId: {
    type: String,
    required: true,
  },
  explanation: {
    type: String,
    default: "",
  },
  marks: {
    type: Number,
    default: 1,
  },
});

const quizSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["final"],
      default: "final",
    },
    duration: {
      type: Number, // in minutes
      required: true,
      default: 20,
    },
    passingPercentage: {
      type: Number,
      required: true,
      default: 60,
      min: 0,
      max: 100,
    },
    maxAttempts: {
      type: Number,
      required: true,
      default: 3,
      min: 1,
    },
    randomizeQuestions: {
      type: Boolean,
      default: true,
    },
    randomizeOptions: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    questions: [questionSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Quiz = mongoose.model("Quiz", quizSchema);
