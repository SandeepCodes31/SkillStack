import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import BuyCourseButton from "@/components/BuyCourseButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  PlayCircle,
  Lock,
  CheckCircle2,
  Users,
  Clock,
  Globe,
  Share2,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Star,
  Award,
  BookOpen,
  ArrowLeft,
  GraduationCap,
} from "lucide-react";

const CourseDetail = () => {
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();

  // 1. Unconditionally declared hooks at the top level
  const { data, isLoading, isError } =
    useGetCourseDetailWithStatusQuery(courseId);

  const course = data?.course;
  const purchased = Boolean(data?.purchased);

  const [activePreviewLecture, setActivePreviewLecture] = useState(null);

  // Sync initial preview lecture once course data loads
  useEffect(() => {
    if (course?.lectures && course.lectures.length > 0) {
      const firstWithVideo =
        course.lectures.find((l) => l.videoUrl && l.isPreviewFree) ||
        course.lectures.find((l) => l.videoUrl) ||
        course.lectures[0];
      setActivePreviewLecture(firstWithVideo);
    }
  }, [course]);

  const handleContinueCourse = () => {
    if (purchased) {
      navigate(`/course-progress/${courseId}`);
    }
  };

  const handleShareCourse = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Course link copied to clipboard!");
    } else {
      toast.info("Share URL: " + window.location.href);
    }
  };

  // 2. High-Fidelity Skeleton Loader
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FBFF] dark:bg-slate-950 pb-16 animate-pulse">
        {/* Hero Banner Skeleton */}
        <div className="bg-[#0B132B] py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="h-4 w-40 bg-slate-800 rounded-md" />
            <div className="h-9 w-3/4 sm:w-1/2 bg-slate-800 rounded-lg" />
            <div className="h-4 w-2/3 bg-slate-800 rounded-md" />
            <div className="flex gap-4 pt-2">
              <div className="h-6 w-24 bg-slate-800 rounded-full" />
              <div className="h-6 w-32 bg-slate-800 rounded-full" />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-48 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" />
            <div className="h-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" />
          </div>
          <div className="lg:col-span-4">
            <div className="h-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  // 3. Error Fallback
  if (isError || !course) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-md text-center shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Course Not Found
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            We couldn't load this course's curriculum. It may have been unpublished or removed.
          </p>
          <Button
            onClick={() => navigate("/course/search?query")}
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs"
          >
            Explore Other Courses
          </Button>
        </div>
      </div>
    );
  }

  const lectures = course.lectures || [];
  const previewVideoUrl =
    activePreviewLecture?.videoUrl || lectures.find((l) => l.videoUrl)?.videoUrl;

  return (
    <div className="min-h-screen bg-[#F8FBFF] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors pb-16">
      {/* ==================================================== */}
      {/* 1. HERO HEADER SECTION                                */}
      {/* ==================================================== */}
      <section className="relative bg-gradient-to-b from-[#0B132B] via-[#0F1E36] to-[#0B132B] text-white border-b border-slate-800/80 pt-8 pb-10 sm:py-12 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-5">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            <Link to="/course/search?query" className="hover:text-white transition-colors">
              Courses
            </Link>
            {course.category && (
              <>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                <span className="text-slate-300 font-medium capitalize">
                  {course.category}
                </span>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            <span className="text-sky-400 font-semibold truncate max-w-xs">
              {course.courseTitle}
            </span>
          </nav>

          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge className="bg-blue-600/30 text-sky-300 border-blue-400/30 text-xs font-semibold px-3 py-1">
              <Sparkles className="w-3 h-3 mr-1 text-sky-400" />
              {course.category || "Professional Development"}
            </Badge>

            <Badge
              variant="outline"
              className="text-slate-300 border-slate-700 bg-slate-800/40 text-xs px-2.5 py-1 uppercase tracking-wider font-semibold"
            >
              {course.courseLevel || "All Levels"}
            </Badge>

            <Badge
              variant="outline"
              className="text-emerald-300 border-emerald-500/30 bg-emerald-950/30 text-xs px-2.5 py-1 font-semibold flex items-center gap-1"
            >
              <Award className="w-3 h-3 text-emerald-400" />
              Verified Certificate
            </Badge>
          </div>

          {/* Course Main Title & Subtitle */}
          <div className="space-y-2 max-w-4xl">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {course.courseTitle}
            </h1>
            {course.subTitle && (
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
                {course.subTitle}
              </p>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="flex flex-wrap items-center gap-y-3 gap-x-6 pt-2 text-xs sm:text-sm text-slate-300 border-t border-slate-800/80">
            {/* Instructor */}
            <div className="flex items-center gap-2">
              <Avatar className="w-7 h-7 ring-1 ring-blue-400/40">
                <AvatarImage src={course.creator?.photoURL} alt={course.creator?.name} />
                <AvatarFallback className="bg-blue-600 text-white text-[11px] font-bold">
                  {course.creator?.name?.substring(0, 2).toUpperCase() || "IN"}
                </AvatarFallback>
              </Avatar>
              <span>
                Created by{" "}
                <span className="font-bold text-white hover:text-sky-300 transition-colors">
                  {course.creator?.name || "SkillStack Faculty"}
                </span>
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>4.9</span>
              <span className="text-slate-400 font-normal">(1,240+ reviews)</span>
            </div>

            {/* Enrolled Students */}
            <div className="flex items-center gap-1.5 text-slate-300">
              <Users className="w-4 h-4 text-sky-400" />
              <span className="font-semibold text-white">
                {course.enrolledStudents?.length || 0}
              </span>
              <span>Learners Enrolled</span>
            </div>

            {/* Updated Date */}
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-4 h-4" />
              <span>
                Updated{" "}
                {course.createdAt
                  ? new Date(course.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  : "Recently"}
              </span>
            </div>

            {/* Language */}
            <div className="flex items-center gap-1.5 text-slate-400">
              <Globe className="w-4 h-4" />
              <span>English [Auto]</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 2. MAIN DETAIL BODY (Split Grid)                      */}
      {/* ==================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* ================================================== */}
          {/* LEFT COLUMN: OVERVIEW, HIGHLIGHTS, CURRICULUM, BIO */}
          {/* ================================================== */}
          <div className="lg:col-span-8 space-y-8">
            {/* Highlights Card */}
            <div className="bg-white dark:bg-slate-900 border border-[#DCEAF7] dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  What You'll Learn &amp; Build
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    Master practical skills through structured lessons and hands-on code examples.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    Build end-to-end projects demonstrating real industry competency.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    Test comprehension with automated quizzes and unlock final assessments.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    Earn an accredited completion certificate with instant verification ID.
                  </span>
                </div>
              </div>
            </div>

            {/* Course Content / Curriculum Section */}
            <div className="bg-white dark:bg-slate-900 border border-[#DCEAF7] dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Course Curriculum
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {lectures.length} Total Lessons • Self-paced video lectures
                  </p>
                </div>
                <span className="text-xs font-semibold text-blue-600 dark:text-sky-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/50 w-fit">
                  Full Lifetime Access
                </span>
              </div>

              {/* Lecture List */}
              <div className="space-y-2.5">
                {lectures.length > 0 ? (
                  lectures.map((lecture, idx) => {
                    const isPreview = lecture.isPreviewFree || idx === 0;
                    const isSelected = activePreviewLecture?._id === lecture._id;

                    return (
                      <div
                        key={lecture._id || idx}
                        onClick={() => {
                          if (lecture.videoUrl) {
                            setActivePreviewLecture(lecture);
                          }
                        }}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 shadow-xs"
                            : "border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
                        } ${lecture.videoUrl ? "cursor-pointer" : "cursor-default"}`}
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isPreview
                                ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-sky-400"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                            }`}
                          >
                            {isPreview ? (
                              <PlayCircle className="w-4 h-4" />
                            ) : (
                              <Lock className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {idx + 1}. {lecture.lectureTitle}
                            </p>
                            <span className="text-[11px] text-slate-400">
                              Lesson • Video Lecture
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          {isPreview ? (
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-sky-300">
                              Preview Free
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              Locked
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 italic py-4">
                    Curriculum lectures are being updated by the instructor.
                  </p>
                )}
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white dark:bg-slate-900 border border-[#DCEAF7] dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Course Description
              </h2>
              <div
                className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3 prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(course.description || "") }}
              />
            </div>

            {/* Instructor Bio Card */}
            <div className="bg-white dark:bg-slate-900 border border-[#DCEAF7] dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Instructor
              </h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Avatar className="w-16 h-16 ring-2 ring-blue-500/20 shadow-xs">
                  <AvatarImage src={course.creator?.photoURL} alt={course.creator?.name} />
                  <AvatarFallback className="bg-blue-600 text-white font-bold text-lg">
                    {course.creator?.name?.substring(0, 2).toUpperCase() || "IN"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {course.creator?.name || "Lead Instructor"}
                  </h3>
                  <p className="text-xs font-medium text-blue-600 dark:text-sky-400">
                    Lead Educator &amp; Industry Mentor
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                    Specialized in industry software architecture, engineering pedagogy, and hands-on skill development on SkillStack.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================== */}
          {/* RIGHT COLUMN: STICKY PRICING & ENROLLMENT CARD     */}
          {/* ================================================== */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-4">
              <Card className="border border-[#DCEAF7] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl rounded-2xl overflow-hidden">
                {/* Media Preview (Video or Course Thumbnail) */}
                <div className="relative aspect-video w-full bg-slate-950 overflow-hidden flex items-center justify-center">
                  {previewVideoUrl ? (
                    <video
                      key={previewVideoUrl}
                      src={previewVideoUrl}
                      controls
                      poster={course.courseThumbnail}
                      className="w-full h-full object-cover"
                    />
                  ) : course.courseThumbnail ? (
                    <img
                      src={course.courseThumbnail}
                      alt={course.courseTitle}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-2 p-4 text-center">
                      <PlayCircle className="w-10 h-10 text-blue-500" />
                      <span className="text-xs">Preview video not available</span>
                    </div>
                  )}

                  {activePreviewLecture && (
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-semibold text-white truncate max-w-[80%] pointer-events-none">
                      Preview: {activePreviewLecture.lectureTitle}
                    </div>
                  )}
                </div>

                {/* Card Content & Pricing */}
                <CardContent className="p-6 space-y-5">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Course Enrollment
                    </p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                        ₹{course.coursePrice ?? 0}
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        ₹{(Number(course.coursePrice || 0) * 1.5).toFixed(0)}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                        33% OFF
                      </span>
                    </div>
                  </div>

                  {/* Primary Call to Action */}
                  <div className="pt-1">
                    {purchased ? (
                      <Button
                        onClick={handleContinueCourse}
                        className="w-full py-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <PlayCircle className="w-5 h-5" />
                        <span>Continue Course</span>
                      </Button>
                    ) : (
                      <BuyCourseButton courseId={courseId} />
                    )}
                  </div>

                  {/* Guarantee Note */}
                  <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>30-Day Money-Back Guarantee</span>
                  </p>

                  <Separator />

                  {/* Course Includes Checklist */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      This Course Includes:
                    </p>
                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                      <li className="flex items-center gap-2.5">
                        <PlayCircle className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{lectures.length} on-demand video lectures</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Interactive project assessment quiz</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Accredited certificate of completion</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span>Full lifetime access on any device</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  {/* Share Course Button */}
                  <Button
                    variant="outline"
                    onClick={handleShareCourse}
                    className="w-full py-5 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-center gap-2 text-slate-700 dark:text-slate-200"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share This Course</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
