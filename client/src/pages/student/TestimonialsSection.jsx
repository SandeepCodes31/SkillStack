import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Star, Quote, CheckCircle2 } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Full-Stack Developer",
    company: "Accenture",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    title: "From Novice to Full-Stack Engineer in 4 Months",
    quote:
      "SkillStack's project-driven approach completely transformed how I learn. The automated quiz verification and end-to-end MERN projects gave me the technical confidence to clear my technical interviews on the first try.",
  },
  {
    name: "Rahul Verma",
    role: "Cloud & DevOps Specialist",
    company: "Oracle",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    title: "Best structured learning experience I've had",
    quote:
      "The streak tracking and quiz unlock mechanism kept me accountable every single day. Being able to download an industry-recognized certificate with a verifiable ID is a huge bonus on LinkedIn.",
  },
  {
    name: "Ananya Patel",
    role: "Data Scientist",
    company: "Meta",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    title: "Clear, practical, and highly engaging lectures",
    quote:
      "No fluff, no outdated tutorials. The instructor went straight into production code, modern libraries, and real-world datasets. I highly recommend SkillStack to anyone serious about upskilling.",
  },
  {
    name: "Siddharth Roy",
    role: "Frontend Architect",
    company: "Adobe",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    title: "The modern React & Next.js curriculum is elite",
    quote:
      "As someone transitioning to senior frontend roles, the deep dive into state management, performance optimization, and clean architecture gave me exactly the skills I needed.",
  },
  {
    name: "Sneha Mukherjee",
    role: "Backend Engineer",
    company: "PayPal",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    title: "Real production databases and security practices",
    quote:
      "I loved the focus on authentication, JWT security, rate-limiting, and Stripe payment integration. Building real production systems rather than toy apps makes all the difference.",
  },
  {
    name: "Arjun Mehta",
    role: "AI & ML Specialist",
    company: "Google Cloud",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    title: "Hands-down the best investment for my career",
    quote:
      "The combination of high quality lectures, hands-on code challenges, instant auto-graded assessments, and verifiable certificates helped me break into machine learning engineering.",
  },
];

const TestimonialsSection = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(testimonials.length / 3); // 2 pages (3 reviews per page)

  const handlePrev = () => {
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  const pages = [
    testimonials.slice(0, 3),
    testimonials.slice(3, 6),
  ];

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F6FAFF] to-white dark:from-slate-950 dark:to-slate-900 border-t border-[#DCEAF7]/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Section Header with Left/Right Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-[#DCEAF7] dark:border-blue-900/60 text-blue-600 dark:text-sky-400 text-xs font-semibold mb-3">
              <Quote className="w-3.5 h-3.5" />
              <span>Learner Testimonials</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
              Trusted by 1,000+ Learners <br className="hidden sm:block" />
              <span className="text-[#2563EB] dark:text-sky-400">Across the Globe</span>
            </h2>
            <p className="text-sm sm:text-base text-[#64748B] dark:text-slate-400 mt-2 max-w-xl">
              Discover how SkillStack students have transformed their careers and achieved
              their dream roles in top technology companies.
            </p>
          </div>

          {/* Carousel Arrows and Page Counter */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {currentPage + 1} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-[#DCEAF7] dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-white shadow-xs transition-colors cursor-pointer"
                aria-label="Previous reviews"
                title="Previous reviews"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-[#DCEAF7] dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-white shadow-xs transition-colors cursor-pointer"
                aria-label="Next reviews"
                title="Next reviews"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Slider Window */}
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentPage * 100}%)` }}
          >
            {pages.map((pageReviews, pageIdx) => (
              <div
                key={pageIdx}
                className="w-full shrink-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
              >
                {pageReviews.map((item) => (
                  <div
                    key={item.name}
                    className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-[#DCEAF7] dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      {/* Rating stars & verified badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1">
                          {[...Array(item.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 fill-amber-400 text-amber-400"
                            />
                          ))}
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified Student
                        </span>
                      </div>

                      {/* Testimonial title */}
                      <h3 className="font-bold text-[#0F172A] dark:text-white text-base mb-2">
                        "{item.title}"
                      </h3>

                      {/* Quote Text */}
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                        {item.quote}
                      </p>
                    </div>

                    {/* Student Info Footer */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500/20"
                          loading="lazy"
                        />
                        <div>
                          <h4 className="font-bold text-sm text-[#0F172A] dark:text-white">
                            {item.name}
                          </h4>
                          <p className="text-xs text-[#64748B] dark:text-slate-400">
                            {item.role} •{" "}
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {item.company}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {pages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentPage
                  ? "w-8 bg-[#2563EB]"
                  : "w-2.5 bg-slate-300 dark:bg-slate-700 hover:bg-blue-400"
              }`}
              aria-label={`Go to review set ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
