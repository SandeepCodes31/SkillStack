import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { useGetPurchasedCoursesQuery } from "@/features/api/purchaseApi";
import { useGetAdminStreakAnalyticsQuery } from "@/features/api/streakApi";
import {
  Flame,
  Users,
  Trophy,
  Activity,
  Award,
  CreditCard,
  TrendingUp,
  Plus,
  ArrowRight,
  BookOpen,
  IndianRupee,
  Sparkles,
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { data, isError, isLoading, refetch } = useGetPurchasedCoursesQuery();
  const { data: streakAnalyticsData, isLoading: streakLoading } = useGetAdminStreakAnalyticsQuery();
  const engagement = streakAnalyticsData?.data;

  if (isLoading || streakLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-8 text-center max-w-md mx-auto shadow-xs space-y-3">
        <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
          <CreditCard className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Failed to Load Analytics Data
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Ensure you are logged in with verified administrator credentials.
        </p>
        <Button
          size="sm"
          onClick={() => refetch()}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl h-9 px-4 mt-1 cursor-pointer"
        >
          Retry
        </Button>
      </div>
    );
  }

  const purchasedCourse = data?.purchasedCourse || [];

  const courseData = purchasedCourse.map((course, idx) => ({
    name: course.courseId?.courseTitle
      ? course.courseId.courseTitle.length > 18
        ? course.courseId.courseTitle.slice(0, 18) + "..."
        : course.courseId.courseTitle
      : `Enrollment #${idx + 1}`,
    price: course.courseId?.coursePrice || course.amount || 0,
    amount: course.amount || 0,
  }));

  const totalRevenue = purchasedCourse.reduce(
    (acc, element) => acc + (element.amount || 0),
    0
  );

  const totalSales = purchasedCourse.length;

  return (
    <div className="space-y-7">
      {/* ==================================================== */}
      {/* 1. TOP HEADER & ACTION BUTTONS */}
      {/* ==================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-sky-300 border border-blue-200/60 dark:border-blue-800 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
            <span>Platform Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor real-time sales, learner engagement telemetry, and institutional growth.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/payments")}
            className="rounded-xl border-[#DCEAF7] dark:border-slate-800 text-xs font-semibold h-10 px-4 cursor-pointer"
          >
            <span>View Payments</span>
          </Button>
          <Button
            size="sm"
            onClick={() => navigate("/admin/course/create")}
            className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold h-10 px-4 rounded-xl shadow-xs cursor-pointer gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Course</span>
          </Button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 2. CORE METRIC STAT CARDS */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Sales */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 shadow-xs hover:border-[#BFDBFE] dark:hover:border-blue-500/50 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Enrollments
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
              {totalSales}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span>Paid student enrollments</span>
            </p>
          </div>
        </div>

        {/* Card 2: Total Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 shadow-xs hover:border-[#BFDBFE] dark:hover:border-blue-500/50 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Gross Platform Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              All-time completed sales
            </p>
          </div>
        </div>

        {/* Card 3: Active Students */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 shadow-xs hover:border-[#BFDBFE] dark:hover:border-blue-500/50 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Active Learners
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
              {engagement?.totalActiveStudents ?? 0}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Learners with logged activity
            </p>
          </div>
        </div>

        {/* Card 4: Activities Today */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 shadow-xs hover:border-[#BFDBFE] dark:hover:border-blue-500/50 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Activities Today
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
              {engagement?.activitiesToday ?? 0}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Lessons & quizzes taken today
            </p>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 3. STUDENT STREAK & ENGAGEMENT INSIGHTS CARD */}
      {/* ==================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <Flame className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                Student Learning Streak & Consistency Telemetry
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Retention metrics measuring daily student habit loops.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Students With Active Streak
            </span>
            <p className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white mt-1">
              {engagement?.studentsWithStreak ?? 0}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Consecutive learners</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Platform Average Streak
            </span>
            <p className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {engagement?.avgStreak ?? 0} days
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Per active student</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Longest Active Streak
            </span>
            <p className="text-lg sm:text-xl font-black text-blue-600 dark:text-sky-400 mt-1">
              {engagement?.longestActiveStreak ?? 0} days
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Top learner record</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Badges Awarded
            </span>
            <p className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {engagement?.totalBadgesEarned ?? 0}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Milestones unlocked</p>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 4. COURSE REVENUE TREND CHART */}
      {/* ==================================================== */}
      <Card className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white">
                Course Revenue Distribution
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Transaction value across enrolled courses and paid modules.
              </CardDescription>
            </div>
            <span className="text-xs font-semibold text-blue-600 dark:text-sky-400">
              {courseData.length} Data Points
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {courseData.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              No enrollment purchase records to chart yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={290}>
              <AreaChart data={courseData} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-10" />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  angle={-20}
                  textAnchor="end"
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-lg text-xs">
                          <p className="font-bold text-slate-900 dark:text-white mb-1">
                            {label}
                          </p>
                          <p className="text-blue-600 dark:text-sky-400 font-extrabold text-sm">
                            ₹{payload[0].value?.toLocaleString("en-IN")}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32 rounded-full" />
        <Skeleton className="h-8 w-48 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
      <Skeleton className="h-44 w-full rounded-2xl" />
      <Skeleton className="h-80 w-full rounded-2xl" />
    </div>
  );
}
