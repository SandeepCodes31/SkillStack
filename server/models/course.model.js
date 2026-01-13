import mongoose, { Mongoose } from "mongoose";

const courseScheme = new mongoose.Schema({
  courseTitle: {
    type: String,
    required: true,
  },
  subTitle: {
    type: String,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
    required: true,
  },
  courseLevel: {
    type: String,
    enum: ["Beginner", "Medium", "Advance"],
  },
  coursePrice: {
    type: Number,
  },
  courseThumbnail: {
    type: String,
  },
  enrolledStudents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  lectures: [
    {
      type: mongoose.Schema.Types.ObjectId,
      // ref: "user",
      ref: "Lecture",
    },
  ],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  isPublished: {
    type: Boolean,
    default:false
  }
},{timestamps:true});

export const Course = mongoose.model("Course" , courseScheme);

