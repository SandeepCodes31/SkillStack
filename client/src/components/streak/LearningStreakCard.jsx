import React from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Trophy, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
import WeeklyStreakView from "./WeeklyStreakView";

const LearningStreakCard = ({ streakData, isLoading = false, onExploreCourses }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[16px] p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)] animate-pulse h-[250px] flex flex-col justify-between">
        <div className="h-5 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
        <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl" />
      </div>
    );
  }

  const {
    currentStreak = 0,
    longestStreak = 0,
    totalLearningDays = 0,
    learnedToday = false,
    weeklyActivity = [],
  } = streakData || {};

  const handleAction = () => {
    if (onExploreCourses) {
      onExploreCourses();
    } else {
      navigate("/my-learning");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[16px] shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-5 flex flex-col justify-between transition-all">
      {/* 1. COMPACT HEADER */}
      <div className="flex items-center justify-between gap-2 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0F172A] dark:text-white leading-tight">
              Learning Streak
            </h2>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400">
              Consistency is the key to skill mastery.
            </p>
          </div>
        </div>

        {learnedToday ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 shrink-0">
            <CheckCircle2 className="w-3 h-3" />
            Learned Today
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 shrink-0">
            <Flame className="w-3 h-3 text-amber-500" />
            Pending Today
          </span>
        )}
      </div>

      {/* 2. STREAK VALUE & QUICK ACTION ROW */}
      <div className="py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-50/60 via-[#FFFBEB]/40 to-transparent dark:from-amber-950/20 dark:via-transparent dark:to-transparent border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between gap-3 my-1">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
            🔥 {currentStreak} {currentStreak === 1 ? "day" : "days"}
          </span>
          <span className="text-xs text-[#64748B] dark:text-slate-400 font-medium hidden sm:inline">
            Current streak
          </span>
        </div>

        {!learnedToday ? (
          <button
            onClick={handleAction}
            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white transition-all cursor-pointer shadow-xs shrink-0"
          >
            <span>Complete today's lesson</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        ) : (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Streak maintained for today!
          </span>
        )}
      </div>

      {/* 3. COMPACT WEEK VIEW */}
      <div className="py-1">
        <WeeklyStreakView weeklyActivity={weeklyActivity} />
      </div>

      {/* 4. FOOTER: LONGEST & TOTAL DAYS */}
      <div className="pt-3 mt-2 border-t border-[#E2E8F0] dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-[#64748B] dark:text-slate-400">
          <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Longest:</span>
          <span className="font-bold text-[#0F172A] dark:text-white">
            {longestStreak} {longestStreak === 1 ? "day" : "days"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[#64748B] dark:text-slate-400 justify-end sm:justify-start">
          <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span>Total Days:</span>
          <span className="font-bold text-[#0F172A] dark:text-white">
            {totalLearningDays} {totalLearningDays === 1 ? "day" : "days"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LearningStreakCard;
