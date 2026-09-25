import React from "react";
import { GraduationCap, Laptop, LineChart, Award, CheckCircle } from "lucide-react";

const features = [
  {
    icon: GraduationCap,
    title: "Learn from Experts",
    description: "Learn directly from experienced practitioners and industry professionals with real production knowledge.",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/50",
  },
  {
    icon: Laptop,
    title: "Hands-on Projects",
    description: "Apply your knowledge immediately with project-based milestones and production-ready portfolio tasks.",
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/50",
  },
  {
    icon: LineChart,
    title: "Track Your Progress",
    description: "Stay motivated with daily learning streaks, lecture completion percentages, and milestone analytics.",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/50",
  },
  {
    icon: Award,
    title: "Earn Certificates",
    description: "Complete 100% of coursework, pass the final assessment, and earn official credentials with QR verification.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/50",
  },
];

const WhySkillStack = () => {
  return (
    <section id="why-skillstack" className="py-16 sm:py-24 bg-[#F6FAFF] dark:bg-[#090f1d] border-b border-[#DCEAF7]/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 mb-3">
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
            Everything You Need to Learn Better
          </h2>
          <p className="mt-3 text-base text-[#64748B] dark:text-slate-400">
            A comprehensive learning architecture built to keep you consistent, engaged, and career-ready.
          </p>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;

            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#DCEAF7] dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg} ${item.color} mb-5`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Built into every course</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhySkillStack;
