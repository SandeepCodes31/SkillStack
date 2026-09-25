import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import Course from "./Course";
import { useGetPublishedCourseQuery } from "@/features/api/courseApi";
import CategorySection from "@/components/landing/CategorySection";
import CourseSearchSection from "@/components/landing/CourseSearchSection";
import WhySkillStack from "@/components/landing/WhySkillStack";
import LearningExperience from "@/components/landing/LearningExperience";
import StatsSection from "@/components/landing/StatsSection";
import TrustedCompanies from "@/components/landing/TrustedCompanies";
import CTASection from "@/components/landing/CTASection";
import TestimonialsSection from "./TestimonialsSection";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const filterChips = [
  "All",
  "Web Development",
  "Frontend",
  "Backend",
  "DevOps",
  "AI/ML",
];

const Courses = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetPublishedCourseQuery();
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Client-side filtering based on selected chip, sorted by newest first
  const coursesList = data?.courses || [];
  const sortedCourses = [...coursesList].sort((a, b) => {
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const filteredCourses = sortedCourses.filter((course) => {
    if (selectedCategory === "All") return true;
    const cat = (course.category || "").toLowerCase();
    const title = (course.courseTitle || "").toLowerCase();
    const sel = selectedCategory.toLowerCase();

    if (sel === "ai/ml") {
      return (
        cat.includes("ai") ||
        cat.includes("ml") ||
        cat.includes("data") ||
        title.includes("ai") ||
        title.includes("ml") ||
        title.includes("python")
      );
    }
    if (sel === "frontend") {
      return (
        cat.includes("frontend") ||
        cat.includes("web") ||
        title.includes("react") ||
        title.includes("frontend") ||
        title.includes("next")
      );
    }
    if (sel === "backend") {
      return (
        cat.includes("backend") ||
        cat.includes("node") ||
        title.includes("backend") ||
        title.includes("node") ||
        title.includes("mongo")
      );
    }
    return cat.includes(sel) || title.includes(sel);
  });

  // Limit featured courses display to maximum 6 current courses
  const displayedCourses = filteredCourses.slice(0, 6);

  return (
    <div className="bg-white dark:bg-slate-950">
      {/* 1. TRUSTED BY COMPANIES (Placed directly below Hero section) */}
      <TrustedCompanies />

      {/* 2. STATISTICS SECTION (Placed directly below Trusted Companies) */}
      <StatsSection />

      {/* 3. EXPLORE CATEGORIES */}
      <CategorySection />

      {/* 4. INTERACTIVE COURSE SEARCH & DISCOVERY */}
      <CourseSearchSection />

      {/* 5. FEATURED COURSES SECTION (Compact, ~1200px max-width, 3-column grid, max 6 courses) */}
      <section id="featured-courses" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto">
        {/* Section Header (Compact) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-7 gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
              Featured Courses
            </h2>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1 max-w-xl">
              Explore popular courses and build practical skills for your career.
            </p>
          </div>

          <Link
            to="/course/search?query"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#2563EB] hover:text-blue-700 dark:text-sky-400 dark:hover:text-sky-300 group cursor-pointer self-start sm:self-auto transition-colors"
          >
            <span>View All Courses</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Small Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 sm:mb-8 scrollbar-none">
          {filterChips.map((chip) => {
            const isActive = selectedCategory === chip;
            return (
              <button
                key={chip}
                onClick={() => setSelectedCategory(chip)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : "bg-[#EFF6FF] text-[#334155] dark:bg-slate-800 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-slate-700"
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>

        {/* Courses Grid: 3 cols desktop (>=1024px), 2 cols tablet (768-1023px), 1 col mobile (<768px), gap: 24px */}
        {isError ? (
          <div className="p-6 text-center bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-[14px]">
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
              Unable to load courses right now. Please check your network connection or try again later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))
              : displayedCourses.length > 0
              ? displayedCourses.map((course) => (
                  <Course key={course._id} course={course} />
                ))
              : (
                <div className="col-span-full py-12 text-center bg-[#F8FBFF] dark:bg-slate-900/50 rounded-[14px] border border-dashed border-[#E2E8F0] dark:border-slate-800">
                  <BookOpen className="w-10 h-10 text-[#64748B] mx-auto mb-2.5 opacity-60" />
                  <h3 className="text-base font-bold text-[#0F172A] dark:text-slate-200">
                    No courses match this filter
                  </h3>
                  <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 mb-3.5">
                    Try selecting "All" or browse our full catalog to discover available courses.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setSelectedCategory("All")}
                    className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-lg"
                  >
                    Reset Filter
                  </Button>
                </div>
              )}
          </div>
        )}
      </section>

      {/* 6. WHY SKILLSTACK PILLARS */}
      <WhySkillStack />

      {/* 7. LEARNING EXPERIENCE & LMS MOCKUP */}
      <LearningExperience />

      {/* 8. TESTIMONIALS */}
      <TestimonialsSection />

      {/* 9. FINAL CTA */}
      <CTASection />
    </div>
  );
};

export default Courses;

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[14px] overflow-hidden shadow-[0_4px_15px_rgba(15,23,42,0.06)] flex flex-col">
      <Skeleton className="w-full aspect-video rounded-t-[14px]" />
      <div className="p-3.5 sm:p-4 space-y-2.5">
        <Skeleton className="h-3 w-16 rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-4/5 rounded" />
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Skeleton className="w-7 h-7 rounded-full" />
            <Skeleton className="h-3.5 w-24 rounded" />
          </div>
          <Skeleton className="h-3.5 w-14 rounded" />
        </div>
        <div className="border-t border-[#E2E8F0] dark:border-slate-800 pt-2.5 flex items-center justify-between">
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
      </div>
    </div>
  );
}
