import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetCreatorCourseQuery } from "@/features/api/courseApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookOpen,
  Plus,
  Edit3,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";

const CourseTable = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useGetCreatorCourseQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "published" | "draft"

  const courses = data?.courses || [];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      (course.courseTitle || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.category || "").toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === "published") {
      return matchesSearch && course.isPublished;
    }
    if (statusFilter === "draft") {
      return matchesSearch && !course.isPublished;
    }
    return matchesSearch;
  });

  if (isLoading) {
    return <CourseTableSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* ==================================================== */}
      {/* 1. TOP HEADER & CREATE BUTTON */}
      {/* ==================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-sky-300 border border-blue-200/60 dark:border-blue-800 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
            <span>Curriculum Management</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
              Courses Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-sky-400 border border-blue-200/60 dark:border-blue-800">
              {courses.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage course curriculum, lecture videos, pricing, and publication statuses.
          </p>
        </div>

        <Button
          onClick={() => navigate("create")}
          className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold h-10 px-4 rounded-xl shadow-xs cursor-pointer flex items-center gap-2 self-start sm:self-auto transition-all active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Course</span>
        </Button>
      </div>

      {/* ==================================================== */}
      {/* 2. SEARCH & FILTER CONTROLS */}
      {/* ==================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by course title or category..."
            className="pl-9 h-9 text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {[
            { id: "all", label: `All (${courses.length})` },
            { id: "published", label: `Published (${courses.filter((c) => c.isPublished).length})` },
            { id: "draft", label: `Drafts (${courses.filter((c) => !c.isPublished).length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ==================================================== */}
      {/* 3. COURSES TABLE CARD */}
      {/* ==================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {filteredCourses.length === 0 ? (
          <div className="py-16 px-4 text-center max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {searchTerm ? "No courses match your search" : "No courses created yet"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {searchTerm
                ? "Try searching for a different keyword or reset filters."
                : "Create your very first course curriculum and start enrolling learners."}
            </p>
            {searchTerm ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="text-xs font-semibold rounded-xl h-8 px-3"
              >
                Clear Search
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => navigate("create")}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl h-9 px-4 gap-1.5 cursor-pointer mt-1"
              >
                <Plus className="w-4 h-4" />
                <span>Create Course</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/75 dark:bg-slate-800/50">
                <TableRow className="border-b border-[#E2E8F0] dark:border-slate-800">
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Course
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Category
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Price
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow
                    key={course._id}
                    className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Course Title & Thumbnail */}
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            course.courseThumbnail ||
                            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=60"
                          }
                          alt={course.courseTitle}
                          className="w-12 h-8 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/60 dark:border-slate-700"
                        />
                        <div className="min-w-0">
                          <p
                            onClick={() => navigate(`${course._id}`)}
                            className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-sky-400 transition-colors cursor-pointer truncate max-w-xs sm:max-w-md"
                          >
                            {course.courseTitle}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {course.lectures?.length || 0} Lectures • {course.courseLevel || "Beginner"}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell className="py-3.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                        {course.category || "General"}
                      </span>
                    </TableCell>

                    {/* Price */}
                    <TableCell className="py-3.5 font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white">
                      {course.coursePrice ? `₹${course.coursePrice}` : "Free"}
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell className="py-3.5 text-center">
                      {course.isPublished ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                          <Clock className="w-2.5 h-2.5" />
                          Draft
                        </span>
                      )}
                    </TableCell>

                    {/* Action */}
                    <TableCell className="py-3.5 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`${course._id}`)}
                        className="h-8 px-3 rounded-lg text-xs font-semibold border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-sky-400 gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Course</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseTable;

function CourseTableSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32 rounded-full" />
        <Skeleton className="h-8 w-56 rounded-lg" />
      </div>
      <Skeleton className="h-14 w-full rounded-2xl" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );
}
