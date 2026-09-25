import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  Award,
  CreditCard,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    description: "Overview & Analytics",
  },
  {
    label: "Courses",
    href: "/admin/course",
    icon: BookOpen,
    description: "Manage Curriculum",
  },
  {
    label: "Quizzes",
    href: "/admin/quizzes",
    icon: HelpCircle,
    description: "Assessments & Exams",
  },
  {
    label: "Certificates",
    href: "/admin/certificates",
    icon: Award,
    description: "Registry & Credentials",
  },
  {
    label: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
    description: "Transactions & Sales",
  },
];

const Sidebar = () => {
  const location = useLocation();

  const isLinkActive = (href) => {
    if (href === "/admin/dashboard") {
      return location.pathname === "/admin/dashboard" || location.pathname === "/admin";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="fixed inset-x-0 top-16 bottom-0 flex flex-col lg:flex-row overflow-hidden bg-[#F8FBFF] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* ==================================================== */}
      {/* 1. DESKTOP FIXED SIDEBAR (lg and up) */}
      {/* ==================================================== */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 h-full shrink-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-r border-[#E2E8F0] dark:border-slate-800 p-4 shadow-xs z-30 overflow-y-auto">
        <div className="space-y-6 pt-2">
          {/* Admin Header Chip */}
          <div className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50/60 dark:from-blue-950/60 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Admin Portal
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                Institutional Control Hub
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Management
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item.href);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer ${
                    active
                      ? "bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-sky-300 font-semibold shadow-2xs border-l-4 border-blue-600"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        active
                          ? "text-blue-600 dark:text-sky-400"
                          : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {active && (
                    <ChevronRight className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* ==================================================== */}
      {/* 2. MOBILE / TABLET HORIZONTAL SUB-NAV (< lg) */}
      {/* ==================================================== */}
      <div className="lg:hidden shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-slate-800 px-3 py-2.5 overflow-x-auto scrollbar-none shadow-2xs z-20">
        <div className="flex items-center gap-1.5 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.href);

            return (
              <Link
                key={item.href}
                to={item.href}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  active
                    ? "bg-blue-600 text-white font-semibold shadow-xs"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ==================================================== */}
      {/* 3. MAIN OUTLET CONTENT AREA */}
      {/* ==================================================== */}
      <main className="flex-1 h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="max-w-7xl mx-auto pb-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Sidebar;
