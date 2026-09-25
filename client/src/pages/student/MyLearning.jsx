import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLoadUserQuery } from "@/features/api/authApi";
import { useGetCourseProgressQuery } from "@/features/api/courseProgressApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Search,
  ArrowRight,
  PlayCircle,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react";

const MyLearning = () => {
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useLoadUserQuery();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All"); // "All" | "In Progress" | "Completed"

  useEffect(() => {
    refetch();
  }, [refetch]);

  const enrolledCourses = data?.user?.enrolledCourses || [];

  // Filter courses locally by search query
  const filteredCourses = enrolledCourses.filter((course) => {
    if (!course) return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const title = (course.courseTitle || "").toLowerCase();
    const cat = (course.category || "").toLowerCase();
    const instructor = (course.creator?.name || "").toLowerCase();
    return title.includes(q) || cat.includes(q) || instructor.includes(q);
  });

  return (
    <div className="min-h-screen bg-[#F7FAFF] dark:bg-slate-950 transition-colors">
      {/* PAGE HEADER */}
      <div className="bg-gradient-to-b from-[#EFF7FF] via-[#F8FBFF] to-[#F7FAFF] dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-950 border-b border-[#E2E8F0] dark:border-slate-800 pt-8 pb-7">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
              My Learning
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
              Your enrolled courses, all in one place.
            </p>
            {enrolledCourses.length > 0 && (
              <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium pt-0.5">
                {enrolledCourses.length}{" "}
                {enrolledCourses.length === 1 ? "enrolled course" : "enrolled courses"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, idx) => (
              <EnrolledCardSkeleton key={idx} />
            ))}
          </div>
        ) : enrolledCourses.length === 0 ? (
          /* EMPTY STATE (No enrolled courses) */
          <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[14px] p-8 sm:p-12 text-center max-w-lg mx-auto shadow-[0_4px_15px_rgba(15,23,42,0.04)] my-6">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] flex items-center justify-center mx-auto mb-3">
              <BookOpen className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-[#0F172A] dark:text-white">
              Start Your Learning Journey
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 max-w-sm mx-auto mt-1 mb-5 leading-relaxed">
              You haven&apos;t enrolled in any courses yet. Discover our catalog of expert-led courses and start building your skills.
            </p>
            <Button
              onClick={() => navigate("/course/search?query")}
              className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold h-9 px-4 rounded-lg cursor-pointer transition-colors"
            >
              Explore Courses &rarr;
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* SEARCH & CONTROLS ROW (Only shown when user has courses) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-white">
                  My Courses
                </h2>
                <p className="text-xs text-[#64748B] dark:text-slate-400">
                  Continue learning from where you left off.
                </p>
              </div>

              {/* Compact Search Field */}
              {enrolledCourses.length > 2 && (
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#64748B]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search my courses..."
                    className="w-full h-9 pl-9 pr-8 rounded-lg border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-[#0F172A] dark:text-white placeholder-[#64748B] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ENROLLED COURSES GRID */}
            {filteredCourses.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[14px] p-8 text-center max-w-md mx-auto">
                <p className="text-sm font-semibold text-[#0F172A] dark:text-white">
                  No courses match &ldquo;{searchQuery}&rdquo;
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-medium text-[#2563EB] hover:underline mt-2 cursor-pointer"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <EnrolledCourseCard
                    key={course._id}
                    course={course}
                    filterStatus={activeFilter}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLearning;

/**
 * EnrolledCourseCard:
 * Displays an enrolled course without prices or wishlist icons.
 * Shows real progress and direct "Continue Learning" link to the lecture player.
 */
const EnrolledCourseCard = ({ course }) => {
  const navigate = useNavigate();

  // Fetch real progress from courseProgressApi
  const { data: progressData } = useGetCourseProgressQuery(course?._id, {
    skip: !course?._id,
  });

  const progressInfo = progressData?.data;
  const progressPercentage = progressInfo?.progressPercentage ?? 0;
  const isCompleted =
    progressInfo?.courseCompleted || progressInfo?.completed || false;
  const hasStarted = progressPercentage > 0;

  // Status badge styling
  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
          <CheckCircle2 className="w-2.5 h-2.5" />
          Completed
        </span>
      );
    }
    if (hasStarted) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
          <Clock className="w-2.5 h-2.5" />
          In Progress
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
        Not Started
      </span>
    );
  };

  // Primary action label & link
  const getAction = () => {
    if (isCompleted) {
      return { label: "Review Course", href: `/course-progress/${course._id}` };
    }
    if (hasStarted) {
      return { label: "Continue Learning", href: `/course-progress/${course._id}` };
    }
    return { label: "Start Learning", href: `/course-progress/${course._id}` };
  };

  const action = getAction();

  return (
    <div className="group bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[14px] overflow-hidden shadow-[0_4px_15px_rgba(15,23,42,0.05)] hover:-translate-y-1 hover:border-[#BFDBFE] dark:hover:border-blue-500/60 hover:shadow-[0_8px_22px_rgba(37,99,235,0.08)] transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* COURSE IMAGE (16:9, rounded-t-[14px], hover scale) */}
        <Link to={action.href} className="block relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={
              course?.courseThumbnail ||
              "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"
            }
            alt={course?.courseTitle || "Course thumbnail"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
          {/* Status badge in top-left */}
          <div className="absolute top-2.5 left-2.5">
            {getStatusBadge()}
          </div>
        </Link>

        {/* CARD CONTENT */}
        <div className="p-4 flex flex-col space-y-2">
          {/* Category */}
          <div>
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.4px] text-[#2563EB] dark:text-sky-400">
              {course?.category || "Course"}
            </span>
          </div>

          {/* Title */}
          <Link to={action.href}>
            <h3 className="text-[15px] sm:text-[16px] font-bold text-[#0F172A] dark:text-white leading-[1.35] line-clamp-2 group-hover:text-[#2563EB] dark:group-hover:text-sky-400 transition-colors min-h-[40px]">
              {course?.courseTitle || "Comprehensive Masterclass"}
            </h3>
          </Link>

          {/* Instructor */}
          <div className="flex items-center gap-2 pt-0.5">
            <Avatar className="w-5 h-5 rounded-full ring-1 ring-slate-200 dark:ring-slate-700 shrink-0">
              <AvatarImage
                src={course?.creator?.photoURL || "https://github.com/shadcn.png"}
                alt={course?.creator?.name || "Instructor"}
              />
              <AvatarFallback className="text-[9px] font-semibold bg-blue-50 text-[#2563EB]">
                {course?.creator?.name?.substring(0, 2).toUpperCase() || "IN"}
              </AvatarFallback>
            </Avatar>
            <span className="text-[12px] sm:text-[13px] font-medium text-[#334155] dark:text-slate-300 truncate">
              {course?.creator?.name || "SkillStack Instructor"}
            </span>
          </div>
        </div>
      </div>

      {/* FOOTER: PROGRESS + PRIMARY ACTION (No Price, No Wishlist) */}
      <div className="px-4 pb-4 pt-1 space-y-2.5">
        {/* Subtle Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#64748B] dark:text-slate-400">
            <span className="font-medium">Progress</span>
            <span className="font-bold text-[#0F172A] dark:text-slate-200">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-sky-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Divider & Action */}
        <div className="pt-2 border-t border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium">
            {isCompleted ? "Course Finished" : hasStarted ? "In Progress" : "Ready to start"}
          </span>

          <button
            onClick={() => navigate(action.href)}
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#2563EB] dark:text-sky-400 hover:text-blue-700 dark:hover:text-sky-300 transition-colors cursor-pointer"
          >
            <span>{action.label}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

const EnrolledCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[14px] overflow-hidden shadow-[0_4px_15px_rgba(15,23,42,0.05)] flex flex-col justify-between">
      <div>
        <Skeleton className="w-full aspect-video rounded-t-[14px]" />
        <div className="p-4 space-y-2.5">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-3/4 rounded" />
          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="w-5 h-5 rounded-full" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
        </div>
      </div>
      <div className="p-4 pt-1 space-y-2.5">
        <div className="space-y-1">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-12 rounded" />
            <Skeleton className="h-3 w-8 rounded" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-3.5 w-24 rounded" />
        </div>
      </div>
    </div>
  );
};
