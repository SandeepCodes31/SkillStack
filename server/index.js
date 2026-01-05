import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
// import courseRoute from "./controllers/course.controllers.js"

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
App.use("/api/v1/user", userRoute);
App.use("/api/v1/course", userRoute);

App.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
