import App from "../server/index.js";

export default function handler(req, res) {
  try {
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

