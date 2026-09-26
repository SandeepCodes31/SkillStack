import mongoose from "mongoose";

let cached = global._mongoConn;
if (!cached) {
  cached = global._mongoConn = { conn: null, promise: null };
}

const DEFAULT_MONGO_URI =
  "mongodb+srv://sandeeppal6926_db_user:Io4rHpRNZOBGS41g@lmsproject.ezpng00.mongodb.net/lms?retryWrites=true&w=majority";

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState >= 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const rawUri = process.env.MONGO_URI || DEFAULT_MONGO_URI;
    const mongoUri = rawUri.trim().replace(/^['"]|['"]$/g, "");

    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    };

    cached.promise = mongoose
      .connect(mongoUri, opts)
      .then((mongooseInstance) => {
        console.log("MongoDB connected successfully");
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        console.error("MongoDB connection error:", err);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
};

export default connectDB;