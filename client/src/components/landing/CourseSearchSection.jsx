import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Sparkles, SlidersHorizontal, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CourseSearchSection = ({ onFilterChange }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "web-dev", label: "Web Development" },
    { value: "data-science", label: "Data Science" },
    { value: "ai-ml", label: "AI & Machine Learning" },
    { value: "ui-ux", label: "UI/UX Design" },
    { value: "cloud", label: "Cloud & DevOps" },
  ];

  const levels = [
    { value: "all", label: "All Difficulty Levels" },
    { value: "Beginner", label: "Beginner" },
    { value: "Medium", label: "Intermediate" },
    { value: "Advance", label: "Advanced" },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set("query", searchTerm.trim());
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (selectedLevel !== "all") params.set("level", selectedLevel);

    if (onFilterChange) {
      onFilterChange({
        query: searchTerm.trim(),
        category: selectedCategory,
        level: selectedLevel,
      });
    }

    navigate(`/course/search?${params.toString()}`);
  };

  return (
    <section className="py-12 bg-white dark:bg-[#070d18] border-b border-[#DCEAF7]/80 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Course Discovery</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
            Find the Right Course for You
          </h2>
          <p className="mt-2 text-sm text-[#64748B] dark:text-slate-400">
            Learn from industry-focused courses designed to help you build real, career-ready skills.
          </p>
        </div>

        {/* Discovery Box */}
        <form
          onSubmit={handleSearchSubmit}
          className="p-3 sm:p-4 rounded-2xl bg-[#F6FAFF] dark:bg-slate-900 border border-[#DCEAF7] dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-3"
        >
          {/* Main Keyword Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              id="course-search-input"
              data-search-input="true"
              data-allow-typing="true"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search courses, skills, or instructors..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-950 border border-[#DCEAF7] dark:border-slate-800 text-[#0F172A] dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-950 border border-[#DCEAF7] dark:border-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Level Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-950 border border-[#DCEAF7] dark:border-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all cursor-pointer"
            >
              {levels.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <Button
            type="submit"
            className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl cursor-pointer text-sm shadow-sm transition-all duration-200 flex items-center justify-center gap-2 shrink-0"
          >
            <span>Search</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </section>
  );
};

export default CourseSearchSection;
