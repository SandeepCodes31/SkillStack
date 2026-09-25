import express from "express";
import isAuthenticated, { authorizeAdmin } from "../middlewares/isAuthenticated.js";
import { createCourse, createLecture, editCourse, editLecture, getCourseById, getCourseLecture, getCreatorCourses, getLectureById, getPublishedCourse, removeLecture, searchCourse, togglePublishCourse } from "../controllers/course.controllers.js";
import upload from "../utils/multer.js"

const router = express.Router();
router.route("/").post(isAuthenticated, authorizeAdmin, createCourse);
router.route("/search").get(isAuthenticated, searchCourse);
router.route("/published-courses").get(getPublishedCourse);

router.route("/").get(isAuthenticated, authorizeAdmin, getCreatorCourses);
router.route("/:courseId").put(isAuthenticated, authorizeAdmin, upload.single("courseThumbnail"), editCourse);
router.route("/:courseId").get(isAuthenticated, getCourseById);
router.route("/:courseId/lecture").post(isAuthenticated, authorizeAdmin, createLecture);
router.route("/:courseId/lecture").get(isAuthenticated, getCourseLecture);

router.route("/:courseId/lecture/:lectureId").post(isAuthenticated, authorizeAdmin, editLecture);
router.route("/lecture/:lectureId").delete(isAuthenticated, authorizeAdmin, removeLecture);
router.route("/lecture/:lectureId").get(isAuthenticated, getLectureById);
router.route("/:courseId").patch(isAuthenticated, authorizeAdmin, togglePublishCourse);

export default router;
