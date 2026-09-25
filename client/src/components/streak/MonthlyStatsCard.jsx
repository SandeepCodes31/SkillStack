import React from "react";
import { CalendarCheck, BookOpen, CheckCircle2, Flame, Trophy } from "lucide-react";

const MonthlyStatsCard = ({ statsData, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-[110px] bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[14px]"
          />
        ))}
      </div>
    );
  }

  const {
    month = "This Month",
    learningDays = 0,
    lessonsCompleted = 0,
    quizzesCompleted = 0,
    currentStreak = 0,
    longestStreak = 0,
  } = statsData || {};

  const statsList = [
    {
      label: "Learning Days",
      value: learningDays,
      icon: CalendarCheck,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800",
      sub: `${month}`,
    },
    {
      label: "Lessons Completed",
      value: lessonsCompleted,
      icon: BookOpen,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800",
      sub: "Modules & lessons",
    },
    {
      label: "Quizzes Completed",
      value: quizzesCompleted,
      icon: CheckCircle2,
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-50 dark:bg-purple-950/60 border border-purple-200/60 dark:border-purple-800",
      sub: "Final assessments",
    },
    {
      label: "Current Streak",
      value: `${currentStreak}d`,
      icon: Flame,
      iconColor: "text-amber-500 dark:text-amber-400",
      iconBg: "bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800",
      sub: currentStreak > 0 ? "Active streak" : "Inactive",
    },
    {
      label: "Longest Streak",
      value: `${longestStreak}d`,
      icon: Trophy,
      iconColor: "text-orange-500 dark:text-orange-400",
      iconBg: "bg-orange-50 dark:bg-orange-950/60 border border-orange-200/60 dark:border-orange-800",
      sub: "Personal best",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {statsList.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[14px] p-3.5 sm:p-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)] flex flex-col justify-between h-[108px] transition-all hover:border-[#BFDBFE] dark:hover:border-blue-500/50"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#64748B] dark:text-slate-400 truncate">
                {stat.label}
              </span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${stat.iconBg} ${stat.iconColor}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <p className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight leading-none">
                {stat.value}
              </p>
              <p className="text-[10px] sm:text-[11px] text-[#64748B] dark:text-slate-400 mt-1 truncate">
                {stat.sub}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MonthlyStatsCard;
