import React from "react";
import { BookOpen, Users, GraduationCap, CheckCircle2 } from "lucide-react";

const stats = [
  {
    number: "250+",
    label: "Industry Courses",
    sub: "Curated by leading professionals",
    icon: BookOpen,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/60",
  },
  {
    number: "1,000+",
    label: "Active Learners",
    sub: "Upskilling across the globe",
    icon: Users,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/60",
  },
  {
    number: "15+",
    label: "Expert Instructors",
    sub: "Direct industry mentorship",
    icon: GraduationCap,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/60",
  },
  {
    number: "2,400+",
    label: "Successful Enrollments",
    sub: "Verified completions and projects",
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/60",
  },
];

const StatsSection = () => {
  return (
    <section className="py-14 sm:py-16 bg-[#F6FAFF] dark:bg-[#090f1d] border-b border-[#DCEAF7]/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;

            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#DCEAF7] dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white tracking-tight">
                  {stat.number}
                </h3>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                  {stat.label}
                </p>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
                  {stat.sub}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
