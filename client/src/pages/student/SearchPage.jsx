import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useGetSearchCourseQuery } from "@/features/api/courseApi";
import Filter from "./Filter";
import SearchResult from "./SearchResult";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SearchX, X, Sparkles, BookOpen } from "lucide-react";

const QUICK_CATEGORIES = [
  "All",
  "Web Development",
  "Frontend Development",
  "Backend Development",
  "Full Stack Development",
  "Data Science",
  "Next JS",
  "DevOps",
];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read state from URL search params
  const query = searchParams.get("query") || "";
  const categoriesParam = searchParams.get("categories");
  const levelsParam = searchParams.get("levels");
  const priceParam = searchParams.get("price") || "all";
  const sortParam = searchParams.get("sort") || "relevance";

  const selectedCategories = categoriesParam
    ? categoriesParam.split(",").map((c) => c.trim()).filter(Boolean)
    : [];

  const selectedLevels = levelsParam
    ? levelsParam.split(",").map((l) => l.trim()).filter(Boolean)
    : [];

  const [searchInput, setSearchInput] = useState(query);

  // Keep local search input synced if query param changes externally
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  // Fetch courses with current filters
  const { data, isLoading } = useGetSearchCourseQuery({
    searchQuery: query,
    categories: selectedCategories,
    levels: selectedLevels,
    price: priceParam === "all" ? "" : priceParam,
    sort: sortParam,
  });

  const courses = data?.courses || [];
  const allCategories = data?.allCategories || [];
  const count = courses.length;

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedLevels.length > 0 ||
    (priceParam && priceParam !== "all");

  const activeFilterCount =
    selectedCategories.length +
    selectedLevels.length +
    (priceParam && priceParam !== "all" ? 1 : 0);

  // Helper to update URL params
  const updateParams = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
        updated.delete(key);
      } else if (Array.isArray(val)) {
        updated.set(key, val.join(","));
      } else {
        updated.set(key, String(val));
      }
    });
    setSearchParams(updated, { replace: true });
  };

  // Search input submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ query: searchInput.trim() });
  };

  // Filter change handlers
  const handleCategoryChange = (category, checked) => {
    const updated = checked
      ? [...selectedCategories, category]
      : selectedCategories.filter((c) => c !== category);
    updateParams({ categories: updated });
  };

  const handleLevelChange = (level, checked) => {
    const updated = checked
      ? [...selectedLevels, level]
      : selectedLevels.filter((l) => l !== level);
    updateParams({ levels: updated });
  };

  const handlePriceChange = (price) => {
    updateParams({ price: price === "all" ? null : price });
  };

  const handleSortChange = (sort) => {
    updateParams({ sort: sort === "relevance" ? null : sort });
  };

  const handleClearAll = () => {
    const updated = new URLSearchParams();
    if (query) {
      updated.set("query", query);
    }
    setSearchParams(updated, { replace: true });
  };

  const handleRemoveCategory = (cat) => {
    const updated = selectedCategories.filter((c) => c !== cat);
    updateParams({ categories: updated });
  };

  const handleRemoveLevel = (lvl) => {
    const updated = selectedLevels.filter((l) => l !== lvl);
    updateParams({ levels: updated });
  };

  // Quick category chip handler
  const handleChipClick = (category) => {
    if (category === "All") {
      updateParams({ categories: [] });
    } else {
      updateParams({ categories: [category] });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAFF] dark:bg-slate-950 transition-colors">
      {/* Subtle top light-blue gradient wash */}
      <div className="bg-gradient-to-b from-[#EFF7FF] via-[#F8FBFF] to-[#F7FAFF] dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-950 border-b border-[#E2E8F0] dark:border-slate-800 pt-8 pb-7">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          {/* COURSE DISCOVERY HERO */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left: Badge, Heading, Subtitle & Count */}
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFF6FF] dark:bg-blue-950/60 border border-[#BFDBFE] dark:border-blue-900/60 text-[#2563EB] dark:text-sky-400 text-[11px] font-semibold">
                <Sparkles className="h-3 w-3" />
                <span>COURSE DISCOVERY</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
                {query ? (
                  <span>
                    Results for &ldquo;<span className="text-[#2563EB]">{query}</span>&rdquo;
                  </span>
                ) : (
                  "Explore Courses"
                )}
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">
                Discover practical courses, learn new skills, and build your career.
              </p>
            </div>

            {/* Right: Modern Search Bar (46–52px height, 12px border-radius) */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative w-full lg:max-w-md"
            >
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                <input
                  type="text"
                  data-search-input="true"
                  data-allow-typing="true"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by course, skill, topic or instructor..."
                  className="w-full h-12 pl-10 pr-24 rounded-xl border border-[#DCE6F2] dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-[#0F172A] dark:text-white placeholder-[#64748B] focus:outline-none focus:border-[#2563EB] focus:ring-3 focus:ring-blue-500/10 shadow-[0_2px_8px_rgba(15,23,42,0.03)] transition-all"
                />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput("");
                        updateParams({ query: null });
                      }}
                      className="p-1 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white cursor-pointer rounded-md transition-colors"
                      title="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <Button
                    type="submit"
                    size="sm"
                    className="h-9 px-3.5 rounded-lg font-semibold text-xs bg-[#2563EB] hover:bg-blue-700 text-white cursor-pointer shadow-xs transition-colors"
                  >
                    Search
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* QUICK CATEGORY CHIPS */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
            {QUICK_CATEGORIES.map((chip) => {
              const isChipActive =
                chip === "All"
                  ? selectedCategories.length === 0
                  : selectedCategories.includes(chip);

              return (
                <button
                  key={chip}
                  onClick={() => handleChipClick(chip)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    isChipActive
                      ? "bg-[#2563EB] text-white shadow-xs font-semibold"
                      : "bg-[#EFF6FF] text-[#334155] dark:bg-slate-800 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA: 280px Filter Sidebar (25%) + Results (75%) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
          {/* Left: Compact Filter Sidebar */}
          <Filter
            selectedCategories={selectedCategories}
            onCategoryChange={handleCategoryChange}
            selectedLevels={selectedLevels}
            onLevelChange={handleLevelChange}
            selectedPrice={priceParam}
            onPriceChange={handlePriceChange}
            onClearAll={handleClearAll}
            allCategories={allCategories}
            hasActiveFilters={hasActiveFilters}
            activeFilterCount={activeFilterCount}
          />

          {/* Right: Course Results */}
          <main className="flex-1 w-full space-y-4">
            {/* Results Toolbar: Course Count, Active Badges, & Sorting */}
            <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[14px] p-3.5 sm:p-4 shadow-[0_2px_8px_rgba(15,23,42,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Left: Section Label & Active filter tags */}
              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                <span className="text-sm font-bold text-[#0F172A] dark:text-white">
                  {hasActiveFilters || query ? "Filtered Courses" : "All Courses"}
                </span>

                {hasActiveFilters && (
                  <>
                    <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
                    {selectedCategories.map((cat) => (
                      <Badge
                        key={cat}
                        variant="secondary"
                        className="gap-1 pl-2.5 pr-1.5 py-0.5 text-[11px] font-medium bg-[#EFF6FF] text-[#2563EB] dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800 cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => handleRemoveCategory(cat)}
                      >
                        <span className="max-w-[120px] truncate">{cat}</span>
                        <X className="h-3 w-3 hover:text-rose-600 shrink-0" />
                      </Badge>
                    ))}
                    {selectedLevels.map((lvl) => (
                      <Badge
                        key={lvl}
                        variant="secondary"
                        className="gap-1 pl-2.5 pr-1.5 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-200 transition-colors"
                        onClick={() => handleRemoveLevel(lvl)}
                      >
                        <span>
                          {lvl === "Advance"
                            ? "Advanced"
                            : lvl === "Medium"
                            ? "Intermediate"
                            : lvl}
                        </span>
                        <X className="h-3 w-3 hover:text-rose-600 shrink-0" />
                      </Badge>
                    ))}
                    {priceParam && priceParam !== "all" && (
                      <Badge
                        variant="secondary"
                        className="gap-1 pl-2.5 pr-1.5 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-200 transition-colors"
                        onClick={() => handlePriceChange("all")}
                      >
                        <span className="capitalize">{priceParam}</span>
                        <X className="h-3 w-3 hover:text-rose-600 shrink-0" />
                      </Badge>
                    )}
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="text-xs text-[#2563EB] hover:underline font-semibold ml-1.5 cursor-pointer"
                    >
                      Clear all
                    </button>
                  </>
                )}
              </div>

              {/* Right: Sort By Dropdown */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <span className="text-xs font-medium text-[#64748B] dark:text-slate-400 whitespace-nowrap">
                  Sort by:
                </span>
                <Select value={sortParam} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[160px] h-8 text-xs font-medium rounded-lg border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Courses List / Loading / Empty State */}
            {isLoading ? (
              <div className="space-y-3.5">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <CourseSkeleton key={idx} />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <CourseNotFound
                onClearFilters={handleClearAll}
                hasActiveFilters={hasActiveFilters || !!query}
              />
            ) : (
              <div className="space-y-3.5">
                {courses.map((course) => (
                  <SearchResult key={course._id} course={course} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

const CourseNotFound = ({ onClearFilters, hasActiveFilters }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[14px] p-8 sm:p-12 text-center shadow-[0_3px_12px_rgba(15,23,42,0.03)] flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] flex items-center justify-center mb-3">
        <SearchX className="h-6 w-6" />
      </div>
      <h3 className="font-bold text-lg text-[#0F172A] dark:text-white">
        No courses found
      </h3>
      <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 max-w-sm mt-1 mb-4 leading-relaxed">
        Try adjusting your search terms or clearing current category and difficulty filters.
      </p>
      {hasActiveFilters ? (
        <Button
          onClick={onClearFilters}
          className="cursor-pointer font-semibold rounded-lg h-9 px-4 text-xs bg-[#2563EB] hover:bg-blue-700 text-white"
        >
          Clear Filters
        </Button>
      ) : (
        <Link to="/">
          <Button className="cursor-pointer font-semibold rounded-lg h-9 px-4 text-xs bg-[#2563EB] hover:bg-blue-700 text-white">
            Browse All Courses
          </Button>
        </Link>
      )}
    </div>
  );
};

const CourseSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[14px] p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <Skeleton className="w-full sm:w-[200px] md:w-[210px] aspect-video rounded-[10px] shrink-0" />
      <div className="flex-1 space-y-2.5 w-full">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-5 w-16 rounded hidden sm:block" />
        </div>
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-3 w-5/6 rounded" />
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded-full" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
          <Skeleton className="h-3 w-16 rounded" />
        </div>
      </div>
    </div>
  );
};
