import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { SlidersHorizontal, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

const DEFAULT_CATEGORIES = [
  "Frontend Development",
  "Backend Development",
  "Full Stack Development",
  "MERN Stack Development",
  "Javascript",
  "Python",
  "Data Science",
  "Next JS",
  "Docker",
  "MongoDB",
  "HTML",
];

const DIFFICULTY_LEVELS = [
  { id: "Beginner", label: "Beginner" },
  { id: "Medium", label: "Intermediate" },
  { id: "Advance", label: "Advanced" },
];

const PRICE_OPTIONS = [
  { id: "all", label: "All" },
  { id: "free", label: "Free" },
  { id: "paid", label: "Paid" },
];

const FilterContent = ({
  selectedCategories = [],
  onCategoryChange,
  selectedLevels = [],
  onLevelChange,
  selectedPrice = "all",
  onPriceChange,
  onClearAll,
  allCategories = [],
  hasActiveFilters = false,
  isMobile = false,
}) => {
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Combine categories dynamically
  const categoriesList = Array.from(
    new Set([
      ...(allCategories && allCategories.length > 0 ? allCategories : []),
      ...DEFAULT_CATEGORIES,
    ])
  ).filter(Boolean);

  const visibleCategories = showAllCategories
    ? categoriesList
    : categoriesList.slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Filter Header */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[#2563EB]" />
          <h2 className="font-bold text-sm tracking-tight text-[#0F172A] dark:text-white">
            Filters
          </h2>
        </div>
        <button
          type="button"
          onClick={onClearAll}
          disabled={!hasActiveFilters}
          className={`text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
            hasActiveFilters
              ? "text-[#2563EB] hover:text-blue-700 hover:underline"
              : "text-slate-400 cursor-not-allowed opacity-50"
          }`}
        >
          <RotateCcw className="h-3 w-3" />
          <span>Clear all</span>
        </button>
      </div>

      <Separator className="bg-[#E2E8F0] dark:bg-slate-800" />

      {/* CATEGORY SECTION */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#64748B] dark:text-slate-400">
            Category
          </h3>
          {selectedCategories.length > 0 && (
            <span className="text-[10px] font-bold text-[#2563EB] bg-[#EFF6FF] dark:bg-blue-950/60 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
              {selectedCategories.length}
            </span>
          )}
        </div>

        <div className="space-y-1">
          {visibleCategories.map((cat) => {
            const isChecked = selectedCategories.includes(cat);
            return (
              <label
                key={cat}
                className="flex items-center space-x-2.5 px-2 py-1.5 rounded-lg hover:bg-[#F0F7FF] dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs sm:text-sm font-medium text-[#334155] dark:text-slate-200 select-none"
              >
                <Checkbox
                  id={`cat-${cat}`}
                  checked={isChecked}
                  onCheckedChange={(checked) => onCategoryChange(cat, !!checked)}
                  className="w-[18px] h-[18px] rounded border-slate-300 data-[state=checked]:bg-[#2563EB] data-[state=checked]:border-[#2563EB] cursor-pointer"
                />
                <span className="flex-1 truncate text-xs sm:text-sm">
                  {cat}
                </span>
              </label>
            );
          })}
        </div>

        {categoriesList.length > 5 && (
          <button
            type="button"
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="text-[11px] font-semibold text-[#2563EB] hover:text-blue-700 dark:text-sky-400 flex items-center gap-1 pt-1 px-2 cursor-pointer transition-colors"
          >
            <span>{showAllCategories ? "Show less" : `Show more (${categoriesList.length - 5} more)`}</span>
            {showAllCategories ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
        )}
      </div>

      <Separator className="bg-[#E2E8F0] dark:bg-slate-800" />

      {/* DIFFICULTY SECTION */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#64748B] dark:text-slate-400">
            Difficulty
          </h3>
          {selectedLevels.length > 0 && (
            <span className="text-[10px] font-bold text-[#2563EB] bg-[#EFF6FF] dark:bg-blue-950/60 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
              {selectedLevels.length}
            </span>
          )}
        </div>

        <div className="space-y-1">
          {DIFFICULTY_LEVELS.map((lvl) => {
            const isChecked = selectedLevels.includes(lvl.id);
            return (
              <label
                key={lvl.id}
                className="flex items-center space-x-2.5 px-2 py-1.5 rounded-lg hover:bg-[#F0F7FF] dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs sm:text-sm font-medium text-[#334155] dark:text-slate-200 select-none"
              >
                <Checkbox
                  id={`lvl-${lvl.id}`}
                  checked={isChecked}
                  onCheckedChange={(checked) => onLevelChange(lvl.id, !!checked)}
                  className="w-[18px] h-[18px] rounded border-slate-300 data-[state=checked]:bg-[#2563EB] data-[state=checked]:border-[#2563EB] cursor-pointer"
                />
                <span className="flex-1 text-xs sm:text-sm">
                  {lvl.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <Separator className="bg-[#E2E8F0] dark:bg-slate-800" />

      {/* PRICE SECTION (Segmented Control) */}
      <div className="space-y-2.5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#64748B] dark:text-slate-400">
          Price
        </h3>
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
          {PRICE_OPTIONS.map((opt) => {
            const isSelected = (selectedPrice || "all") === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onPriceChange(opt.id)}
                className={`h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : "bg-transparent text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {isMobile && (
        <div className="pt-4 space-y-2">
          <SheetClose asChild>
            <Button className="w-full h-10 font-semibold bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl cursor-pointer">
              Apply Filters
            </Button>
          </SheetClose>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={onClearAll}
              className="w-full h-10 font-semibold rounded-xl cursor-pointer border-slate-200 dark:border-slate-800"
            >
              Reset All
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

const Filter = ({
  selectedCategories = [],
  onCategoryChange,
  selectedLevels = [],
  onLevelChange,
  selectedPrice = "all",
  onPriceChange,
  onClearAll,
  allCategories = [],
  hasActiveFilters = false,
  activeFilterCount = 0,
}) => {
  return (
    <>
      {/* Mobile Filters Drawer Trigger Button */}
      <div className="md:hidden w-full">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="w-full flex items-center justify-between h-11 px-4 rounded-xl border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-2 font-semibold text-sm text-[#0F172A] dark:text-white">
                <SlidersHorizontal className="h-4 w-4 text-[#2563EB]" />
                <span>Filters</span>
              </div>
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center h-5 px-2 text-xs font-bold bg-[#2563EB] text-white rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[310px] sm:w-[360px] p-6 overflow-y-auto">
            <SheetHeader className="pb-4 text-left border-b border-slate-100 dark:border-slate-800">
              <SheetTitle className="text-base font-bold text-[#0F172A] dark:text-white">
                Filter Courses
              </SheetTitle>
            </SheetHeader>
            <div className="pt-4">
              <FilterContent
                selectedCategories={selectedCategories}
                onCategoryChange={onCategoryChange}
                selectedLevels={selectedLevels}
                onLevelChange={onLevelChange}
                selectedPrice={selectedPrice}
                onPriceChange={onPriceChange}
                onClearAll={onClearAll}
                allCategories={allCategories}
                hasActiveFilters={hasActiveFilters}
                isMobile={true}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sticky 280px Sidebar */}
      <aside className="hidden md:block w-[280px] shrink-0 sticky top-[84px] self-start z-10">
        <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[14px] p-5 shadow-[0_3px_12px_rgba(15,23,42,0.04)] max-h-[calc(100vh-104px)] overflow-y-auto scrollbar-none">
          <FilterContent
            selectedCategories={selectedCategories}
            onCategoryChange={onCategoryChange}
            selectedLevels={selectedLevels}
            onLevelChange={onLevelChange}
            selectedPrice={selectedPrice}
            onPriceChange={onPriceChange}
            onClearAll={onClearAll}
            allCategories={allCategories}
            hasActiveFilters={hasActiveFilters}
            isMobile={false}
          />
        </div>
      </aside>
    </>
  );
};

export default Filter;
