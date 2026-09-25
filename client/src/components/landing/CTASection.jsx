import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-[#070d18] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-sky-600 p-8 sm:p-12 md:p-16 text-white text-center shadow-xl shadow-blue-500/15">
          {/* Subtle Decorative Background Rings */}
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-sky-300/15 blur-2xl pointer-events-none" />

          <div className="relative max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md text-white border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Start Your Journey Today</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Ready to Start Learning?
            </h2>

            <p className="text-base sm:text-lg text-blue-100 leading-relaxed max-w-xl mx-auto">
              Build practical skills, complete real-world projects, and take the next confident step in your career.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => navigate("/course/search?query")}
                className="w-full sm:w-auto px-8 py-3 bg-white hover:bg-slate-100 text-blue-600 font-bold rounded-xl text-sm shadow-md cursor-pointer gap-2 transition-transform hover:scale-105"
              >
                <span>Explore Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto px-8 py-3 bg-transparent hover:bg-white/10 border-2 border-white text-white font-bold rounded-xl text-sm cursor-pointer transition-colors"
              >
                Create Free Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
