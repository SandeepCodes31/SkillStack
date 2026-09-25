import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useLoadUserQuery } from "@/features/api/authApi";
import { useGetCourseProgressQuery } from "@/features/api/courseProgressApi";
import { useGetPublishedCourseQuery } from "@/features/api/courseApi";
import { useGetMyStreakQuery } from "@/features/api/streakApi";
import { useGetMyCertificatesQuery } from "@/features/api/certificateApi";
import {
  ArrowRight,
  Sparkles,
  PlayCircle,
  Flame,
  Award,
  CheckCircle2,
  Users,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const navigate = useNavigate();

  // Authentication & Logged in User
  const { user: authUser, isAuthenticated } = useSelector((store) => store.auth);
  const { data: userData } = useLoadUserQuery();
  const user = (isAuthenticated && authUser) || userData?.user || null;
  const isUserAuthenticated = Boolean(user && user._id);

  // Real Streak & Certificate Data
  const { data: streakResponse } = useGetMyStreakQuery(undefined, { skip: !isUserAuthenticated });
  const { data: certsResponse } = useGetMyCertificatesQuery(undefined, { skip: !isUserAuthenticated });

  // Published Courses Query (for fallback / live catalog preview)
  const { data: publishedData } = useGetPublishedCourseQuery();
  const publishedCourses = publishedData?.courses || [];
  const fallbackCourse = publishedCourses.length > 0 ? publishedCourses[0] : null;

  // Determine user's active enrolled course
  const enrolledCourses = user?.enrolledCourses || [];
  const hasEnrolled = enrolledCourses.length > 0;
  // Pick the latest enrolled course
  const activeEnrolled = hasEnrolled ? enrolledCourses[enrolledCourses.length - 1] : null;
  const activeCourseId = typeof activeEnrolled === "object" ? activeEnrolled?._id : activeEnrolled;

  // Real Course Progress Query for active enrolled course
  const { data: progressData } = useGetCourseProgressQuery(activeCourseId, {
    skip: !activeCourseId,
  });

  const progressInfo = progressData?.data;
  const courseDetails =
    progressInfo?.courseDetails ||
    (typeof activeEnrolled === "object" ? activeEnrolled : null);

  // Active course to display
  const displayCourse = hasEnrolled ? courseDetails : fallbackCourse;

  const courseTitle =
    displayCourse?.courseTitle ||
    (hasEnrolled ? "Current Course" : "Full-Stack MERN Architecture");

  const instructorName =
    displayCourse?.creator?.name ||
    (hasEnrolled ? "Alex Morgan" : "Alex Morgan");

  const lecturesList =
    displayCourse?.lectures && Array.isArray(displayCourse.lectures)
      ? displayCourse.lectures
      : [];
  const totalLectures = lecturesList.length || (hasEnrolled ? 18 : 18);

  const completedCount =
    hasEnrolled && progressInfo?.progress
      ? progressInfo.progress.filter((p) => p.viewed).length
      : 0;

  const progressPercentage = hasEnrolled
    ? (progressInfo?.progressPercentage ??
       (totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0))
    : (user ? 0 : 78);

  const displayedLessonsCompleted = hasEnrolled
    ? `${completedCount} of ${totalLectures} lessons completed`
    : (user ? `0 of ${totalLectures} lessons completed` : "14 of 18 lessons completed");

  const isCompleted = hasEnrolled && (progressInfo?.courseCompleted || progressPercentage >= 100);

  const quizStatus = hasEnrolled
    ? (isCompleted
        ? "Quiz passed & verified 🎓"
        : progressPercentage >= 100
        ? "Quiz unlocked & ready 🎯"
        : "Quiz unlocked at 100%")
    : "Quiz unlocked at 100%";

  // Action button label & navigation
  let resumeButtonLabel = "Resume Lesson: Authentication & JWT";
  let handleResumeAction = () => navigate("/course/search?query");

  if (hasEnrolled && activeCourseId) {
    if (progressInfo?.courseCompleted) {
      resumeButtonLabel = "Review Course";
      handleResumeAction = () => navigate(`/course-progress/${activeCourseId}`);
    } else if (progressPercentage >= 100) {
      resumeButtonLabel = "Take Assessment Quiz";
      handleResumeAction = () => navigate(`/course/${activeCourseId}/quiz`);
    } else {
      // Find the first unviewed lecture
      const nextUnviewed = lecturesList.find((lec) => {
        const lecId = lec?._id?.toString() || lec?.toString();
        const item = progressInfo?.progress?.find(
          (p) => p.lectureId?.toString() === lecId
        );
        return !item || !item.viewed;
      });

      if (nextUnviewed?.lectureTitle) {
        resumeButtonLabel = `Resume Lesson: ${nextUnviewed.lectureTitle}`;
      } else if (lecturesList[0]?.lectureTitle) {
        resumeButtonLabel =
          completedCount > 0
            ? `Resume Course (${progressPercentage}%)`
            : `Start Lesson: ${lecturesList[0].lectureTitle}`;
      } else {
        resumeButtonLabel = "Continue Learning";
      }
      handleResumeAction = () => navigate(`/course-progress/${activeCourseId}`);
    }
  } else if (fallbackCourse?._id) {
    resumeButtonLabel = `Start Course: ${fallbackCourse.courseTitle}`;
    handleResumeAction = () => navigate(`/course-detail/${fallbackCourse._id}`);
  }

  // Real streak data
  const currentStreak =
    streakResponse?.data?.effectiveCurrentStreak ??
    streakResponse?.data?.currentStreak;
  const streakDisplay =
    user && currentStreak !== undefined
      ? `${currentStreak} Day${currentStreak === 1 ? "" : "s"} Fire 🔥`
      : "7 Days Fire 🔥";

  // Real credentials data
  const certsCount = certsResponse?.certificates?.length;
  const certsDisplay =
    user && certsCount !== undefined
      ? `${certsCount} Verified`
      : "3 Verified";

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative pt-6 pb-12 md:pt-12 md:pb-16 overflow-hidden bg-gradient-to-b from-[#F6FAFF] via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-400/15 via-sky-300/15 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-12 -right-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* LEFT CONTENT (7 cols) */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF4FF] dark:bg-blue-950/70 border border-[#DCEAF7] dark:border-blue-800/80 text-blue-700 dark:text-sky-300 text-xs sm:text-sm font-semibold shadow-xs">
              <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
              <span>Next-Gen Online Learning Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Unlock Your Potential & <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-blue-700 dark:from-blue-400 dark:via-sky-400 dark:to-blue-500">
                Move Your Career Forward
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Master in-demand software, data, and design skills with expert-crafted
              curriculum, interactive project quizzes, automated evaluations, and
              verifiable certificates.
            </p>

            {/* Call To Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Button
                size="lg"
                onClick={() => navigate("/course/search?query")}
                className="w-full sm:w-auto text-base font-semibold px-7 py-6 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all transform active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Explore Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection("categories")}
                className="w-full sm:w-auto text-base font-semibold px-7 py-6 rounded-xl border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-blue-50/70 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Learning Paths</span>
              </Button>
            </div>

            {/* Trust Proof & Social Proof */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center -space-x-2">
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Learner"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="Learner"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                  alt="Learner"
                />
                <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-[11px] font-bold ring-2 ring-white dark:ring-slate-900">
                  +1k
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-500 font-bold">★★★★★</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">4.9/5</span>
                <span>(1,200+ Reviews)</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Certificates</span>
              </div>
            </div>
          </div>

          {/* RIGHT DASHBOARD PREVIEW MOCKUP (5 cols) */}
          <div className="lg:col-span-5 relative">
            {/* Background Gradient card framing */}
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Decorative behind card */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500 to-sky-400 rounded-3xl blur-md opacity-25 dark:opacity-35" />

              {/* Main LMS Dashboard Mockup Card (Dynamic: Guest Visual vs. Logged-in Dashboard) */}
              {isUserAuthenticated ? (
                /* Logged-In User Live Dashboard Card */
                <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 shadow-2xl border border-[#DCEAF7] dark:border-slate-800">
                  {/* Header of Mockup */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-rose-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-xs font-semibold text-slate-400 ml-2">
                        SkillStack LMS Live
                      </span>
                    </div>
                    {hasEnrolled ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Enrolled
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-sky-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        Explore
                      </span>
                    )}
                  </div>

                  {/* Course Currently In Progress */}
                  <div className="mt-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 pr-3">
                        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                          Current Course
                        </span>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base mt-0.5 truncate">
                          {courseTitle}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          Instructor: {instructorName} • {totalLectures} Modules
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-sky-400 shrink-0">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-600 dark:text-slate-300">Course Progress</span>
                        <span className="text-blue-600 dark:text-sky-400 font-bold">{progressPercentage}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-sky-500 rounded-full transition-all duration-1000"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{displayedLessonsCompleted}</span>
                        <span>{quizStatus}</span>
                      </div>
                    </div>

                    {/* CTA button inside card */}
                    <button
                      onClick={handleResumeAction}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      <PlayCircle className="w-4 h-4 shrink-0" />
                      <span className="truncate">{resumeButtonLabel}</span>
                    </button>
                  </div>

                  {/* Floating Badge 1: Streak */}
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
                    <div
                      onClick={() => navigate("/student/dashboard")}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 cursor-pointer hover:bg-amber-100/70 dark:hover:bg-amber-950/50 transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                        <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400 truncate">
                          Active Streak
                        </p>
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                          {streakDisplay}
                        </p>
                      </div>
                    </div>

                    {/* Floating Badge 2: Certificate */}
                    <div
                      onClick={() => navigate("/student/dashboard")}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 cursor-pointer hover:bg-blue-100/70 dark:hover:bg-blue-950/50 transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-sky-400 shrink-0">
                        <Award className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase font-bold text-blue-800 dark:text-blue-400 truncate">
                          Credential
                        </p>
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                          {certsDisplay}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Guest View: High-Quality Student Learning Photo & Animated Skills Badges */
                <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-2xl border border-[#DCEAF7] dark:border-slate-800 overflow-hidden space-y-4">
                  {/* Student Learning Photo Container with Floating Animated Badges */}
                  <div className="relative rounded-2xl overflow-hidden shadow-md group">
                    <img
                      src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80"
                      alt="Students learning and coding collaboratively with laptop"
                      className="w-full aspect-[16/10] object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />

                    {/* Floating Skill Badge 1: React.js (Top Left) */}
                    <div className="absolute top-3 left-3 animate-float-slow bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-sky-200 dark:border-slate-700 flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span>⚛️ React & Next.js</span>
                    </div>

                    {/* Floating Skill Badge 2: Python & AI (Top Right) */}
                    <div className="absolute top-3 right-3 animate-float-delayed bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-amber-200 dark:border-slate-700 flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                      <span>🐍 Python & Data</span>
                    </div>

                    {/* Floating Certification Badge (Bottom Right over photo) */}
                    <div className="absolute bottom-3 right-3 animate-float-slow bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xl border border-emerald-200 dark:border-slate-700 flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <Award className="w-4 h-4 text-emerald-500" />
                      <span>Verified Credentials 🎓</span>
                    </div>

                    {/* Floating Live Badge (Bottom Left over photo) */}
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Interactive Classroom</span>
                    </div>
                  </div>

                  {/* Skills Logos & Technologies Bar */}
                  <div className="pt-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        In-Demand Skills &amp; Stack
                      </span>
                      <span className="text-xs font-bold text-blue-600 dark:text-sky-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        250+ Courses
                      </span>
                    </div>

                    {/* Animated Floating Skills Badges Grid */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-sky-300 border border-blue-100 dark:border-blue-900/50 shadow-2xs hover:scale-105 transition-transform cursor-default">
                        <span className="text-sm">⚛️</span> React.js
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-100 dark:border-amber-900/50 shadow-2xs hover:scale-105 transition-transform cursor-default">
                        <span className="text-sm">🐍</span> Python
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-yellow-50 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-900/50 shadow-2xs hover:scale-105 transition-transform cursor-default">
                        <span className="text-sm">⚡</span> JavaScript
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50 shadow-2xs hover:scale-105 transition-transform cursor-default">
                        <span className="text-sm">🟢</span> Node.js
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50 shadow-2xs hover:scale-105 transition-transform cursor-default">
                        <span className="text-sm">☁️</span> Cloud Architecture
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-100 dark:border-purple-900/50 shadow-2xs hover:scale-105 transition-transform cursor-default">
                        <span className="text-sm">🤖</span> AI &amp; ML
                      </span>
                    </div>

                    {/* Trust & Community Proof */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-slate-600 dark:text-slate-300 font-medium">
                          Join 1,000+ active learners today
                        </span>
                      </div>
                      <span className="text-amber-500 font-bold">★ 4.9/5 Rating</span>
                    </div>

                    {/* Guest Call To Actions */}
                    <div className="pt-1 flex items-center gap-2.5">
                      <Button
                        onClick={() => navigate("/signup")}
                        className="flex-1 py-5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>Start Learning Free</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate("/login")}
                        className="py-5 px-4 rounded-xl border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        Sign In
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
