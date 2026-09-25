import React from "react";
import { useNavigate } from "react-router-dom";
import { Code, Database, Brain, Palette, Cloud, TrendingUp, ArrowRight } from "lucide-react";

const categories = [
  {
    id: "web-dev",
    name: "Web Development",
    count: "24 Courses",
    icon: Code,
    description: "Frontend, Backend & Full Stack architectures",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    borderHover: "hover:border-blue-500/60 dark:hover:border-blue-500/60",
  },
  {
    id: "data-science",
    name: "Data Science",
    count: "18 Courses",
    icon: Database,
    description: "Analytics, Python, SQL & Visualizations",
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/40",
    borderHover: "hover:border-sky-500/60 dark:hover:border-sky-500/60",
  },
  {
    id: "ai-ml",
    name: "AI & Machine Learning",
    count: "16 Courses",
    icon: Brain,
    description: "Neural Networks, NLP & Predictive Models",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    borderHover: "hover:border-indigo-500/60 dark:hover:border-indigo-500/60",
  },
  {
    id: "ui-ux",
    name: "UI/UX Design",
    count: "14 Courses",
    icon: Palette,
    description: "Figma, User Research & Design Systems",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    borderHover: "hover:border-purple-500/60 dark:hover:border-purple-500/60",
  },
  {
    id: "cloud-devops",
    name: "Cloud & DevOps",
    count: "12 Courses",
    icon: Cloud,
    description: "AWS, Docker, Kubernetes & CI/CD Pipelines",
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-950/40",
    borderHover: "hover:border-cyan-500/60 dark:hover:border-cyan-500/60",
  },
  {
    id: "digital-marketing",
    name: "Digital Marketing",
    count: "10 Courses",
    icon: TrendingUp,
    description: "Growth, SEO, Brand Strategy & Analytics",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    borderHover: "hover:border-emerald-500/60 dark:hover:border-emerald-500/60",
  },
];

const CategorySection = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName) => {
    navigate(`/course/search?query=${encodeURIComponent(categoryName)}`);
  };

  return (
    <section id="categories" className="py-16 sm:py-20 bg-[#F6FAFF] dark:bg-[#0b1120] border-y border-[#DCEAF7]/60 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 mb-3">
            Career Paths
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
            Explore Skills That Matter
          </h2>
          <p className="mt-3 text-base text-[#64748B] dark:text-slate-400">
            Choose a learning path and start building practical, industry-ready skills today.
          </p>
        </div>

        {/* 6 Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;

            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name)}
                className={`group cursor-pointer p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#DCEAF7] dark:border-slate-800 shadow-xs hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between ${cat.borderHover}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.bg} ${cat.color} transition-transform group-hover:scale-110 duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {cat.count}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#0F172A] dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400 line-clamp-2">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <span>Explore Courses</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
