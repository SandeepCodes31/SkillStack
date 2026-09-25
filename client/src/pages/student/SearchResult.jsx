import React from "react";
import { Link } from "react-router-dom";
import { Star, ArrowRight, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const SearchResult = ({ course }) => {
  const isFree = course.coursePrice === 0 || !course.coursePrice;

  // Level badge styling
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
          Intermediate
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
        {course.courseLevel || "All Levels"}
      </span>
    );
  };

  return (
    <div className="group bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[14px] p-3.5 sm:p-4 shadow-[0_3px_12px_rgba(15,23,42,0.04)] hover:-translate-y-0.5 hover:border-[#BFDBFE] dark:hover:border-blue-500/60 hover:shadow-[0_8px_22px_rgba(37,99,235,0.08)] transition-all duration-200">
      <Link
        to={`/course-detail/${course._id}`}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full"
      >
        {/* Course Thumbnail: 190–210px wide on desktop, 16:9 aspect ratio */}
        <div className="relative w-full sm:w-[200px] md:w-[210px] shrink-0 aspect-video rounded-[10px] overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
          <img
            src={
              course.courseThumbnail ||
              "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"
            }
            alt={course.courseTitle}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>

        {/* Course Info & Details */}
        <div className="flex-1 flex flex-col justify-between min-w-0 w-full space-y-1.5">
          {/* Top Row: Category */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.4px] text-[#2563EB] dark:text-sky-400">
              {course.category || "Development"}
            </span>

            {/* Price (Desktop Right-aligned) */}
            <div className="hidden sm:block text-right shrink-0">
              {isFree ? (
                <span className="text-[17px] sm:text-[18px] font-bold text-emerald-600 dark:text-emerald-400">
                  Free
                </span>
              ) : (
                <span className="text-[17px] sm:text-[18px] font-bold text-[#2563EB] dark:text-sky-400">
                  ₹{course.coursePrice}
                </span>
              )}
            </div>
          </div>

          {/* Course Title */}
          <h3 className="font-bold text-[15px] sm:text-[17px] text-[#0F172A] dark:text-white leading-[1.35] line-clamp-1 sm:line-clamp-2 group-hover:text-[#2563EB] dark:group-hover:text-sky-400 transition-colors">
            {course.courseTitle}
          </h3>

          {/* Short Description */}
          {course.subTitle ? (
            <p className="text-[13px] text-[#64748B] dark:text-slate-400 line-clamp-2 leading-relaxed">
              {course.subTitle}
            </p>
          ) : (
            <p className="text-[13px] text-[#64748B] dark:text-slate-400 line-clamp-2 leading-relaxed">
              Master practical skills and build portfolio projects with hands-on exercises and expert curriculum.
            </p>
          )}

          {/* Bottom Metadata & Mobile Price/Action */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80">
            {/* Instructor, Level & Rating */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] dark:text-slate-400">
              {/* Instructor */}
              <div className="flex items-center gap-1.5">
                <Avatar className="w-5 h-5 rounded-full ring-1 ring-slate-200 dark:ring-slate-700">
                  <AvatarImage
                    src={course.creator?.photoURL || "https://github.com/shadcn.png"}
                    alt={course.creator?.name || "Instructor"}
                  />
                  <AvatarFallback className="text-[9px] bg-blue-50 text-[#2563EB]">
                    {course.creator?.name?.substring(0, 2).toUpperCase() || "IN"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[12px] sm:text-[13px] font-medium text-[#334155] dark:text-slate-300 truncate max-w-[130px]">
                  {course.creator?.name || "SkillStack Instructor"}
                </span>
              </div>

              <span className="text-slate-300 dark:text-slate-700">•</span>

              {/* Difficulty badge */}
              {getLevelBadge(course.courseLevel)}

              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>

              {/* Rating */}
              <div className="hidden sm:flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-[11px] sm:text-[12px] font-bold text-[#0F172A] dark:text-slate-200">
                  4.8
                </span>
              </div>
            </div>

            {/* Mobile Price & CTA */}
            <div className="flex items-center gap-3 ml-auto">
              <div className="sm:hidden">
                {isFree ? (
                  <span className="text-[16px] font-bold text-emerald-600 dark:text-emerald-400">
                    Free
                  </span>
                ) : (
                  <span className="text-[16px] font-bold text-[#2563EB] dark:text-sky-400">
                    ₹{course.coursePrice}
                  </span>
                )}
              </div>
              <span className="inline-flex items-center gap-1 text-[12px] sm:text-[13px] font-semibold text-[#2563EB] dark:text-sky-400 group-hover:text-blue-700 dark:group-hover:text-sky-300 transition-colors">
                <span>View Course</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default SearchResult;
