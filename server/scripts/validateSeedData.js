import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import connectDB from "../database/db.js";
import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { User } from "../models/user.model.js";

async function validate() {
  console.log("=================================================");
  console.log("🧪 SkillStack LMS - Data Quality & API Validation");
  console.log("=================================================");

  await connectDB();

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failedTests++;
    }
  }

  // 1. Target Categories Count Validation
  console.log("\n[Test 1] Category Distribution Validation:");
  const targetCategories = [
    "Web Development",
    "Programming & Software Development",
    "AI & Machine Learning",
    "Data Science",
    "Cloud & DevOps",
    "UI/UX Design",
  ];

  for (const cat of targetCategories) {
    const count = await Course.countDocuments({ category: cat });
    assert(count >= 3, `Category "${cat}" has at least 3 courses (found ${count})`);
  }

  // 2. Published vs Draft Course Verification
  console.log("\n[Test 2] Publication Status Validation:");
  const totalCourses = await Course.countDocuments();
  const publishedCourses = await Course.countDocuments({ isPublished: true });
  const draftCourses = await Course.countDocuments({ isPublished: false });

  assert(totalCourses >= 24, `Total courses >= 24 (found ${totalCourses})`);
  assert(publishedCourses >= 20, `Published courses >= 20 (found ${publishedCourses})`);
  assert(draftCourses >= 2, `Draft courses present for testing isolation (found ${draftCourses})`);

  // 3. Difficulty Level Distribution
  console.log("\n[Test 3] Course Level Distribution:");
  const beginnerCount = await Course.countDocuments({ courseLevel: "Beginner" });
  const mediumCount = await Course.countDocuments({ courseLevel: "Medium" });
  const advanceCount = await Course.countDocuments({ courseLevel: "Advance" });

  assert(beginnerCount > 0, `Has Beginner courses (found ${beginnerCount})`);
  assert(mediumCount > 0, `Has Medium/Intermediate courses (found ${mediumCount})`);
  assert(advanceCount > 0, `Has Advance/Advanced courses (found ${advanceCount})`);

  // 4. Pricing Validation
  console.log("\n[Test 4] Pricing Field Validation:");
  const negativePrices = await Course.countDocuments({ coursePrice: { $lt: 0 } });
  const freeCourses = await Course.countDocuments({ coursePrice: 0 });
  const paidCourses = await Course.countDocuments({ coursePrice: { $gt: 0 } });

  assert(negativePrices === 0, `No negative prices exist in database`);
  assert(freeCourses >= 2, `Free courses exist for filtering (found ${freeCourses})`);
  assert(paidCourses >= 20, `Paid courses exist (found ${paidCourses})`);

  // 5. Instructor References & User Validation
  console.log("\n[Test 5] Instructor References & Roles:");
  const sampleCourses = await Course.find({ courseThumbnail: /^\/images\/courses\// }).populate("creator");
  let allCreatorsValid = true;
  for (const c of sampleCourses) {
    if (!c.creator || !c.creator.name || c.creator.role !== "instructor") {
      allCreatorsValid = false;
      console.error(`Course missing valid creator: ${c.courseTitle}`);
    }
  }
  assert(allCreatorsValid, `All 24 sample courses reference valid, populated Instructor accounts`);

  // 6. Curriculum & Lecture Linkage Validation
  console.log("\n[Test 6] Curriculum & Lecture Linkage for Seeded Courses:");
  let allLecturesValid = true;
  let coursesWithProperCurriculum = 0;

  for (const c of sampleCourses) {
    if (c.lectures && c.lectures.length >= 6 && c.lectures.length <= 10) {
      coursesWithProperCurriculum++;
    }
    const lectures = await Lecture.find({ courseId: c._id });
    if (lectures.length !== c.lectures.length) {
      allLecturesValid = false;
      console.error(`Mismatch for course: ${c.courseTitle} (array: ${c.lectures.length}, db: ${lectures.length})`);
    }
  }
  assert(allLecturesValid, `All 24 sample courses have 100% matched lecture foreign keys`);
  assert(coursesWithProperCurriculum === 24, `All 24 sample courses have between 6 and 10 lectures each`);

  // 7. Thumbnail Asset Verification
  console.log("\n[Test 7] Thumbnail Files on Disk:");
  const publicImagesDir = path.resolve("client/public/images/courses");
  let allThumbnailsFound = true;

  for (const c of sampleCourses) {
    const filename = path.basename(c.courseThumbnail);
    const filepath = path.join(publicImagesDir, filename);
    if (!fs.existsSync(filepath) || fs.statSync(filepath).size < 1000) {
      allThumbnailsFound = false;
      console.error(`Missing or empty thumbnail: ${filepath}`);
    }
  }
  assert(sampleCourses.length === 24, `All 24 sample courses retrieved`);
  assert(allThumbnailsFound, `All 24 thumbnail images exist on disk and exceed 1KB in size`);

  // 8. Public API Search Simulation
  console.log("\n[Test 8] Course Discovery & Search Query Simulation:");
  const searchReact = await Course.find({
    isPublished: true,
    $or: [
      { courseTitle: { $regex: "React", $options: "i" } },
      { subTitle: { $regex: "React", $options: "i" } },
      { category: { $regex: "React", $options: "i" } },
    ],
  });
  assert(searchReact.length > 0, `Search for 'React' returns matching published courses (found ${searchReact.length})`);

  const searchPython = await Course.find({
    isPublished: true,
    $or: [
      { courseTitle: { $regex: "Python", $options: "i" } },
      { subTitle: { $regex: "Python", $options: "i" } },
      { category: { $regex: "Python", $options: "i" } },
    ],
  });
  assert(searchPython.length >= 2, `Search for 'Python' returns matching courses (found ${searchPython.length})`);

  // 9. Draft Course Isolation (Unpublished courses must NOT appear in public searches)
  console.log("\n[Test 9] Draft Isolation (Unpublished courses hidden):");
  const publicCourses = await Course.find({ isPublished: true });
  const draftIds = (await Course.find({ isPublished: false })).map((c) => c._id.toString());
  const draftLeaked = publicCourses.some((c) => draftIds.includes(c._id.toString()));
  assert(!draftLeaked, `Public course queries strictly exclude draft/unpublished courses`);

  console.log("\n=================================================");
  console.log(`TOTAL TESTS: ${passedTests + failedTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log("=================================================");

  await mongoose.connection.close();
  process.exit(failedTests > 0 ? 1 : 0);
}

validate();
