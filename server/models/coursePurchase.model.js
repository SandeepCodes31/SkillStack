import mongoose from "mongoose";
const coursePurchaseSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled", "refunded"],
      default: "pending",
      index: true,
    },
    currency: {
      type: String,
      default: "inr",
      lowercase: true,
    },
    paymentMethod: {
      type: String,
      default: "card",
    },
    paymentId: {
      type: String,
      required: true,
      index: true,
    },
    stripePaymentIntentId: {
      type: String,
      index: true,
    },
    stripeEventId: {
      type: String,
      index: true,
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    receiptNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    paidAt: {
      type: Date,
    },
    refundedAt: {
      type: Date,
    },
    refundId: {
      type: String,
    },
  },
  { timestamps: true },
);

export const CoursePurchase = mongoose.model(
  "CoursePurchase",
  coursePurchaseSchema,
);
