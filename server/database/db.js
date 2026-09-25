import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      "mongodb+srv://sandeeppal6926_db_user:Io4rHpRNZOBGS41g@lmsproject.ezpng00.mongodb.net/lms?retryWrites=true&w=majority";
    const conn = await mongoose.connect(mongoUri);
    isConnected = Boolean(conn.connections[0].readyState);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

export default connectDB;