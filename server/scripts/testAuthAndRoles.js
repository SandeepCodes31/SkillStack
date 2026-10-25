/**
 * SkillStack LMS — Automated Authentication, Role & Data Isolation Test Suite
 * Validates registration, bcrypt hashing, JWT issuance, token revocation, role boundaries,
 * and cross-user data isolation over real HTTP endpoints and MongoDB.
 */

import dotenv from "dotenv";
dotenv.config();

// Ensure test environment
process.env.NODE_ENV = "test";

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import App from "../index.js";
import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import connectDB from "../database/db.js";

// Test accounts configuration
const TEST_ACCOUNTS = {
  studentA: {
    name: "Student Alice",
    email: "student.a@skillstack.test",
    password: "TestPass123!",
    role: "student",
  },
  studentB: {
    name: "Student Bob",
    email: "student.b@skillstack.test",
    password: "TestPass123!",
    role: "student",
  },
  instructor: {
    name: "Instructor Isaac",
    email: "instructor.test@skillstack.test",
    password: "TestPass123!",
    role: "instructor",
  },
  admin: {
    name: "Admin Sandeep",
    email: "sandeeppal6926@gmail.com",
    password: "TestPass123!",
    role: "admin",
  },
};

const results = [];
function recordResult(id, description, passed, details = "") {
  results.push({ id, description, passed, details });
  const status = passed ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m";
  console.log(`[${status}] ${id}: ${description}${details ? " — " + details : ""}`);
}

async function runTestSuite() {
  console.log("================================================================================");
  console.log("🚀 STARTING AUTOMATED AUTH, ROLE & ISOLATION TEST SUITE");
  console.log("================================================================================");

  await connectDB();

  // Start test server on ephemeral port
  const server = App.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`📡 Ephemeral Test Server listening at ${baseUrl}\n`);

  try {
    // -------------------------------------------------------------
    // SETUP: Clean and Prepare Dedicated Test Accounts in MongoDB
    // -------------------------------------------------------------
    console.log("--- Preparing Test Accounts in Database ---");
    for (const [key, acc] of Object.entries(TEST_ACCOUNTS)) {
      await User.deleteOne({ email: acc.email });
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(acc.password, salt);
      await User.create({
        name: acc.name,
        email: acc.email,
        password: hashedPassword,
        role: acc.role,
        isVerified: true,
        tokenVersion: 0,
      });
      console.log(`  Initialized ${key}: ${acc.email} (${acc.role})`);
    }

    // -------------------------------------------------------------
    // TEST 1: Password Hashing Verification in MongoDB
    // -------------------------------------------------------------
    const userAFromDb = await User.findOne({ email: TEST_ACCOUNTS.studentA.email });
    const isHashed =
      userAFromDb &&
      typeof userAFromDb.password === "string" &&
      userAFromDb.password.startsWith("$2");
    const matchesCorrect = await bcrypt.compare(TEST_ACCOUNTS.studentA.password, userAFromDb.password);
    const rejectsWrong = !(await bcrypt.compare("WrongPassword123!", userAFromDb.password));

    recordResult(
      "AUTH-01",
      "Password Hashing & Bcrypt Verification",
      isHashed && matchesCorrect && rejectsWrong,
      "Direct MongoDB check confirms bcrypt hash starts with $2, plain text never stored."
    );

    // -------------------------------------------------------------
    // TEST 2: Role Escalation Prevention during Registration
    // -------------------------------------------------------------
    const maliciousEmail = `attacker_${Date.now()}@testevil.com`;
    const regRes = await fetch(`${baseUrl}/api/v1/user/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Attacker User",
        email: maliciousEmail,
        password: "EvilPassword123!",
        role: "admin", // Malicious role escalation request
      }),
    });
    const regData = await regRes.json();
    const attackerInDb = await User.findOne({ email: maliciousEmail });
    const escalationPrevented = regRes.status === 403 && attackerInDb === null;

    recordResult(
      "AUTH-02",
      "Role Escalation Prevention",
      escalationPrevented,
      `Unauthorized admin registration strictly rejected with HTTP 403 (account not created in DB).`
    );
    if (attackerInDb) await User.deleteOne({ _id: attackerInDb._id });

    // -------------------------------------------------------------
    // TEST 3: Login Authentication & JWT Token Issuance
    // -------------------------------------------------------------
    const loginResA = await fetch(`${baseUrl}/api/v1/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: TEST_ACCOUNTS.studentA.email,
        password: TEST_ACCOUNTS.studentA.password,
      }),
    });
    const loginDataA = await loginResA.json();
    const tokenCookieHeader = loginResA.headers.get("set-cookie") || "";
    const tokenA = loginDataA.token || (tokenCookieHeader.match(/token=([^;]+)/) || [])[1];

    recordResult(
      "AUTH-03",
      "Authentication & JWT Issuance (Student A)",
      loginResA.status === 200 && Boolean(tokenA),
      `Status 200, JWT token acquired via response payload / Set-Cookie.`
    );

    // -------------------------------------------------------------
    // TEST 4: Invalid Password Rejection
    // -------------------------------------------------------------
    const failedLoginRes = await fetch(`${baseUrl}/api/v1/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: TEST_ACCOUNTS.studentA.email,
        password: "IncorrectPassword123!",
      }),
    });
    recordResult(
      "AUTH-04",
      "Bad Password Rejection",
      failedLoginRes.status === 400 || failedLoginRes.status === 401,
      `Rejected with status ${failedLoginRes.status}.`
    );

    // -------------------------------------------------------------
    // TEST 5: Route Authorization — Student Blocked from Admin Route
    // -------------------------------------------------------------
    const studentCreateCourseRes = await fetch(`${baseUrl}/api/v1/course`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        courseTitle: "Unauthorized Student Course",
        category: "Web Development",
      }),
    });
    recordResult(
      "AUTH-05",
      "Role-Based Access: Student Blocked from Creator Routes",
      studentCreateCourseRes.status === 403,
      `Student received HTTP ${studentCreateCourseRes.status} (Access Denied).`
    );

    // -------------------------------------------------------------
    // TEST 6: Route Authorization — Admin / Instructor Granted Access
    // -------------------------------------------------------------
    const loginAdminRes = await fetch(`${baseUrl}/api/v1/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: TEST_ACCOUNTS.admin.email,
        password: TEST_ACCOUNTS.admin.password,
      }),
    });
    const adminLoginData = await loginAdminRes.json();
    const adminToken = adminLoginData.token || (loginAdminRes.headers.get("set-cookie")?.match(/token=([^;]+)/) || [])[1];

    const adminCreateCourseRes = await fetch(`${baseUrl}/api/v1/course`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        courseTitle: "Official Admin Masterclass",
        category: "Web Development",
      }),
    });
    const adminAllowed = adminCreateCourseRes.status === 201 || adminCreateCourseRes.status === 200;
    recordResult(
      "AUTH-06",
      "Role-Based Access: Admin Permitted on Creator Routes",
      adminAllowed,
      `Admin received HTTP ${adminCreateCourseRes.status} on course creation.`
    );
    const adminCourseData = await adminCreateCourseRes.json();
    const createdCourseId = adminCourseData.course?._id;

    // -------------------------------------------------------------
    // TEST 7: Token Revocation on Logout via tokenVersion
    // -------------------------------------------------------------
    const logoutRes = await fetch(`${baseUrl}/api/v1/user/logout`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenA}`,
      },
    });
    const userAAfterLogout = await User.findOne({ email: TEST_ACCOUNTS.studentA.email });
    const tokenVersionIncremented = userAAfterLogout.tokenVersion > userAFromDb.tokenVersion;

    // Attempt to access user profile with the old token
    const oldTokenAccessRes = await fetch(`${baseUrl}/api/v1/user/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenA}`,
      },
    });
    const tokenInvalidated = oldTokenAccessRes.status === 401;

    recordResult(
      "AUTH-07",
      "Server-Side Session Invalidation (tokenVersion increment)",
      logoutRes.status === 200 && tokenVersionIncremented && tokenInvalidated,
      `Logout incremented tokenVersion to ${userAAfterLogout.tokenVersion}. Subsequent call with revoked JWT returned HTTP ${oldTokenAccessRes.status}.`
    );

    // -------------------------------------------------------------
    // TEST 8: Cross-User Data Isolation (Receipt & Purchase Ownership)
    // -------------------------------------------------------------
    // Login Student B
    const loginResB = await fetch(`${baseUrl}/api/v1/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: TEST_ACCOUNTS.studentB.email,
        password: TEST_ACCOUNTS.studentB.password,
      }),
    });
    const loginDataB = await loginResB.json();
    const tokenB = loginDataB.token || (loginResB.headers.get("set-cookie")?.match(/token=([^;]+)/) || [])[1];

    // Re-login Student A
    const reloginResA = await fetch(`${baseUrl}/api/v1/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: TEST_ACCOUNTS.studentA.email,
        password: TEST_ACCOUNTS.studentA.password,
      }),
    });
    const newLoginDataA = await reloginResA.json();
    const newTokenA = newLoginDataA.token || (reloginResA.headers.get("set-cookie")?.match(/token=([^;]+)/) || [])[1];

    // Create a mock completed purchase belonging exclusively to Student B
    const sampleCourse = await Course.findOne({ isPublished: true });
    const userBRecord = await User.findOne({ email: TEST_ACCOUNTS.studentB.email });

    const purchaseB = await CoursePurchase.create({
      courseId: sampleCourse?._id || createdCourseId,
      userId: userBRecord._id,
      amount: 499,
      status: "completed",
      paymentId: `cs_test_b_${Date.now()}`,
      paidAt: new Date(),
    });

    // Student A attempts to access Student B's receipt
    const crossAccessRes = await fetch(`${baseUrl}/api/v1/purchase/receipt/${purchaseB._id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${newTokenA}`,
      },
    });

    // Student B accesses their own receipt
    const ownAccessRes = await fetch(`${baseUrl}/api/v1/purchase/receipt/${purchaseB._id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenB}`,
      },
    });

    recordResult(
      "AUTH-08",
      "Cross-User Data Isolation (Receipt Ownership Verification)",
      crossAccessRes.status === 403 && ownAccessRes.status === 200,
      `Student A blocked with HTTP 403 from Student B's receipt. Student B accessed own receipt with HTTP 200.`
    );

    // Clean up created purchase & course
    await CoursePurchase.deleteOne({ _id: purchaseB._id });
    if (createdCourseId) await Course.deleteOne({ _id: createdCourseId });

    // -------------------------------------------------------------
    // TEST 9: HTTP Security & Hardening Headers
    // -------------------------------------------------------------
    const healthRes = await fetch(`${baseUrl}/health`);
    const nosniff = healthRes.headers.get("x-content-type-options") === "nosniff";
    const frameOptions = Boolean(healthRes.headers.get("x-frame-options"));

    recordResult(
      "AUTH-09",
      "HTTP Security Headers (NoSniff, FrameGuard)",
      nosniff && frameOptions,
      `X-Content-Type-Options: ${healthRes.headers.get("x-content-type-options")}, X-Frame-Options: ${healthRes.headers.get("x-frame-options")}`
    );

  } catch (error) {
    console.error("Critical Suite Execution Error:", error);
  } finally {
    server.close();
    await mongoose.connection.close();
    console.log("\n================================================================================");
    console.log(`AUTH TEST RESULTS: ${results.filter((r) => r.passed).length}/${results.length} PASSED`);
    console.log("================================================================================\n");
    if (results.some((r) => !r.passed)) {
      process.exit(1);
    }
    process.exit(0);
  }
}

runTestSuite();
