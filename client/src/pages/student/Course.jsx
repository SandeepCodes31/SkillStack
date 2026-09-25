import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, ArrowRight, Heart } from "lucide-react";
import { toast } from "sonner";

const Course = ({ course }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(
      isWishlisted
        ? `Removed "${course?.courseTitle || "course"}" from wishlist`
        : `Added "${course?.courseTitle || "course"}" to wishlist!`
    );
  };

  // Safe level color mapping (Subtle, modern tones)
  const getLevelBadge = (level) => {
    const l = level?.toLowerCase();
    if (l === "beginner") {
      return (
        <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
          Beginner
        </span>
      );
    }
    if (l === "medium" || l === "intermediate") {
      return (
        <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
          Medium
        </span>
      );
    }
    if (l === "advance" || l === "advanced") {
      return (
        <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
          Advanced
        </span>
      );
    }
    return (
      <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
        {course?.courseLevel || "All Levels"}
      </span>
    );
  };

  return (
    <Link to={`/course-detail/${course?._id}`} className="block h-full group">
      <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[14px] overflow-hidden shadow-[0_4px_15px_rgba(15,23,42,0.06)] hover:-translate-y-1 hover:shadow-md hover:border-[#BFDBFE] dark:hover:border-blue-500/60 transition-all duration-200 flex flex-col">
        {/* 1. COURSE IMAGE */}
        <div className="relative w-full aspect-video overflow-hidden rounded-t-[14px] bg-slate-100 dark:bg-slate-800">
          <img
            src={
              course?.courseThumbnail ||
              "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"
            }
            alt={course?.courseTitle || "Course thumbnail"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />

          {/* Level Badge in top-left */}
          <div className="absolute top-2.5 left-2.5">
            {getLevelBadge(course?.courseLevel)}
          </div>

          {/* Wishlist Button in top-right (32px x 32px circular) */}
          <button
            onClick={toggleWishlist}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 dark:bg-slate-900/90 shadow-sm flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-label="Wishlist"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWishlisted
                  ? "fill-rose-500 text-rose-500"
                  : "text-slate-500 hover:text-[#2563EB] dark:text-slate-400"
              }`}
            />
          </button>
        </div>

        {/* 2. COURSE CONTENT (Compact, content-driven layout) */}
        <div className="p-3.5 sm:p-4 flex flex-col">
          {/* CATEGORY (Directly above title, 6px bottom gap) */}
          <div className="mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.4px] text-[#2563EB] dark:text-sky-400">
              {course?.category || "Technology"}
            </span>
          </div>

          {/* COURSE TITLE (Primary content, 15-16px, line-height 1.35, 2 lines clamp, 8px bottom gap) */}
          <h3 className="text-[15px] sm:text-[16px] font-bold text-[#0F172A] dark:text-white leading-[1.35] line-clamp-2 group-hover:text-[#2563EB] dark:group-hover:text-sky-400 transition-colors mb-2 min-h-[40px]">
            {course?.courseTitle || "Comprehensive Masterclass"}
          </h3>

          {/* INSTRUCTOR + RATING (Compact row: Avatar 28-30px, Instructor 12-13px, Rating 11-12px) */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="w-7 h-7 rounded-full ring-1 ring-slate-200 dark:ring-slate-700 shrink-0">
                <AvatarImage
                  src={
                    course?.creator?.photoURL || "https://github.com/shadcn.png"
                  }
                  alt={course?.creator?.name || "Instructor"}
                />
                <AvatarFallback className="text-[10px] font-semibold bg-blue-50 text-[#2563EB]">
                  {course?.creator?.name?.substring(0, 2).toUpperCase() || "IN"}
                </AvatarFallback>
              </Avatar>
              <span className="text-[12px] sm:text-[13px] font-medium text-[#334155] dark:text-slate-300 truncate">
                {course?.creator?.name || "SkillStack Instructor"}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0 text-[11px] sm:text-[12px]">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-[#0F172A] dark:text-slate-200">
                4.8
              </span>
              <span className="text-[#64748B] dark:text-slate-400">
                ({course?.enrolledStudents?.length ? `${course.enrolledStudents.length * 8 + 42}` : "72"})
              </span>
            </div>
          </div>

          {/* DIVIDER (Subtle border-top: 1px solid #E2E8F0) */}
          <div className="border-t border-[#E2E8F0] dark:border-slate-800 pt-2.5 mt-0.5 flex items-center justify-between">
            {/* PRICE (₹999 in #2563EB, font-bold 16-17px) */}
            <span className="text-[16px] sm:text-[17px] font-bold text-[#2563EB] dark:text-sky-400">
              ₹{course?.coursePrice ?? 499}
            </span>

            {/* VIEW COURSE (Compact text CTA, 12-13px font-semibold #2563EB) */}
            <span className="inline-flex items-center gap-1 text-[12px] sm:text-[13px] font-semibold text-[#2563EB] dark:text-sky-400 group-hover:text-blue-700 dark:group-hover:text-sky-300 transition-colors">
              <span>View Course</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Course;
