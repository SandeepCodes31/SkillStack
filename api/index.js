import App from "../server/index.js";
import connectDB from "../server/database/db.js";

export default async function handler(req, res) {
  try {
    await connectDB();
    return App(req, res);
  } catch (error) {
    console.error("Vercel Serverless Function Execution Error:", error);
    if (!res.headersSent) {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        success: false,
        message: error?.message || "Internal server error in API function",
      });
    }
  }
}

