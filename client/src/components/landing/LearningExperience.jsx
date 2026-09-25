import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Play, Award, Flame, BookOpen, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  "Track real-time course progress across all enrolled lessons",
  "Continue seamlessly right where you left off on any device",
  "Engage with high-definition video lessons with full transcripts",
  "Evaluate your skills with automatic server-scored assessments",
  "Earn verifiable digital certificates backed by unique security QR codes",
];

const LearningExperience = () => {
  const navigate = useNavigate();

  return (
    <section id="about" className="py-16 sm:py-24 bg-white dark:bg-[#070d18] border-b border-[#DCEAF7]/80 dark:border-slate-800 transition-colors overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Benefits & Value Prop */}
          <div className="lg:col-span-6 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
              Personalized Dashboard
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] dark:text-white tracking-tight leading-tight">
              Your Learning Journey, <br />
              <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
                All in One Place
              </span>
            </h2>

            <p className="text-base text-[#64748B] dark:text-slate-400 leading-relaxed">
              Experience an intuitive learning ecosystem tailored to your goals. Manage coursework, stay consistent with streak alerts, and showcase verified credentials to prospective employers.
            </p>

            <div className="space-y-3 pt-2">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Button
                onClick={() => navigate("/course/search?query")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 py-2.5 cursor-pointer text-sm shadow-sm gap-2"
              >
                <span>Start Learning Now</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/verify-certificate")}
                className="rounded-xl border-[#DCEAF7] dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer text-sm"
              >
                Verify a Credential
              </Button>
            </div>
          </div>

          {/* Right Column: Modern LMS Dashboard Mockup */}
          <div className="lg:col-span-6 relative">
            {/* Subtle blue gradient background aura */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 via-sky-400/10 to-transparent rounded-3xl blur-2xl pointer-events-none" />

            <div className="relative p-6 sm:p-7 rounded-3xl bg-[#F6FAFF] dark:bg-slate-900 border border-[#DCEAF7] dark:border-slate-800 shadow-xl shadow-blue-500/5 space-y-5">
              {/* Mockup Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#DCEAF7] dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    SkillStack Learning Portal
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-xs font-bold">
                  <Flame className="w-3.5 h-3.5 fill-amber-500" />
                  <span>7 Day Streak</span>
                </div>
              </div>

              {/* Active Course Progress Card */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-[#DCEAF7] dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      In Progress
                    </span>
                    <h4 className="text-base font-bold text-[#0F172A] dark:text-white mt-0.5">
                      Full Stack Web Development
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Module 4: React Server Components & APIs
                    </p>
                  </div>
                  <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                    72%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-sky-500 rounded-full w-[72%]" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>12 / 18 lessons completed</span>
                    <span>1h 45m remaining</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Last active 2 hours ago</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => navigate("/my-learning")}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs py-1 px-3 cursor-pointer gap-1"
                  >
                    <span>Continue</span>
                    <Play className="w-3 h-3 fill-current" />
                  </Button>
                </div>
              </div>

              {/* Mini Features Preview Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-[#DCEAF7] dark:border-slate-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#0F172A] dark:text-white truncate">
                      3 Certificates
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      Official credentials
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-[#DCEAF7] dark:border-slate-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#0F172A] dark:text-white truncate">
                      8 Interactive Quizzes
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      Passing grade &ge; 60%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LearningExperience;
