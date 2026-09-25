import mongoose from "mongoose";

const lectureProgressSchema = new mongoose.Schema({
    lectureId:{type:String},
    viewed:{type:Boolean}
});

const courseProgressSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    courseId: { type: String, required: true, index: true },
    completed: { type: Boolean, default: false }, // true when all lectures viewed
    progressPercentage: { type: Number, default: 0 },
    courseCompleted: { type: Boolean, default: false }, // true only when progress === 100 AND finalAssessmentPassed === true
    finalAssessmentPassed: { type: Boolean, default: false },
    finalAssessmentScore: { type: Number, default: null },
    completedAt: { type: Date, default: null },
    certificateId: { type: String, default: null },
    lectureProgress: [lectureProgressSchema],
  },
  { timestamps: true }
);

courseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const CourseProgress = mongoose.model("CourseProgress", courseProgressSchema);

