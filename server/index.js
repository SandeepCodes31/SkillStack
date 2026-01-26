import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js"
import courseProgressRoute from "../server/routes/courseProgress.route.js"


dotenv.config({});
// Call databse connection here
connectDB();

const App = express();

const PORT = process.env.PORT || 3000;

//default middleware
App.use(express.json());
App.use(cookieParser());
App.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

//Apis
App.use("/api/v1/media", mediaRoute);
App.use("/api/v1/user", userRoute);
App.use("/api/v1/course", courseRoute);
App.use("/api/v1/purchase", purchaseRoute);
App.use("/api/v1/progress", courseProgressRoute);



App.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
