import React from "react";
import { Check, Circle } from "lucide-react";

const WeeklyStreakView = ({ weeklyActivity = [] }) => {
  if (!weeklyActivity || weeklyActivity.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="text-[11px] font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
        <span>This Week</span>
        <span className="text-[10px] font-normal text-slate-400">Mon – Sun</span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {weeklyActivity.map((day) => {
          const { dayName, dayNumber, isCompleted, isToday, isPast } = day;

          return (
            <div
              key={day.date}
              className={`flex flex-col items-center justify-between py-1.5 px-1 rounded-xl transition-all h-[58px] sm:h-[62px] ${
                isToday
                  ? "bg-[#EFF6FF] dark:bg-blue-950/50 border-2 border-[#2563EB] dark:border-blue-500 shadow-xs"
                  : isCompleted
                  ? "bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/80"
                  : "bg-slate-50 dark:bg-slate-800/40 border border-[#E2E8F0] dark:border-slate-800"
              }`}
            >
              {/* Day Name */}
              <span
                className={`text-[10px] sm:text-[11px] font-semibold leading-none ${
                  isToday
                    ? "text-[#2563EB] dark:text-sky-400 font-bold"
                    : isCompleted
                    ? "text-amber-700 dark:text-amber-400"
                    : "text-[#64748B] dark:text-slate-400"
                }`}
              >
                {dayName}
              </span>

              {/* Day Date Number */}
              <span className="text-[10px] text-slate-400 leading-none">
                {dayNumber}
              </span>

              {/* Status Indicator Icon */}
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? "bg-amber-500 text-white shadow-xs"
                    : isToday
                    ? "border-2 border-[#2563EB] text-[#2563EB] bg-blue-100 dark:bg-blue-900/40"
                    : isPast
                    ? "text-slate-300 dark:text-slate-600"
                    : "text-slate-200 dark:text-slate-700"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3 h-3 stroke-[3]" />
                ) : isToday ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                ) : (
                  <Circle className="w-2.5 h-2.5 stroke-[1.5]" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyStreakView;
