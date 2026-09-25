import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLoadUserQuery } from "@/features/api/authApi";
import { useGetPublishedCourseQuery } from "@/features/api/courseApi";
import { useGetMyPurchasesQuery } from "@/features/api/purchaseApi";
import { useGetMyCertificatesQuery } from "@/features/api/certificateApi";
import {
  useGetMyStreakQuery,
  useGetMyBadgesQuery,
  useGetMyLearningStatsQuery,
} from "@/features/api/streakApi";
import ReceiptModal, { handleDownloadPdf } from "@/components/ReceiptModal";
import CertificateModal, { handleDownloadCertificatePdf } from "@/components/CertificateModal";
import LearningStreakCard from "@/components/streak/LearningStreakCard";
import MonthlyStatsCard from "@/components/streak/MonthlyStatsCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  Compass,
  ArrowRight,
  CreditCard,
  FileText,
  Download,
  Loader2,
  Award,
  Eye,
  Star,
  CheckCircle2,
  Lock,
} from "lucide-react";

const StudentDashboard = () => {
  const navigate = useNavigate();

  // Queries
  const { data: userData, isLoading: userLoading } = useLoadUserQuery();
  const { data: coursesData, isLoading: coursesLoading } = useGetPublishedCourseQuery();
  const { data: purchasesData, isLoading: purchasesLoading } = useGetMyPurchasesQuery();
  const { data: certsData, isLoading: certsLoading } = useGetMyCertificatesQuery();
  const { data: streakResponse, isLoading: streakLoading } = useGetMyStreakQuery();
  const { data: badgesResponse } = useGetMyBadgesQuery();
  const { data: statsResponse, isLoading: statsLoading } = useGetMyLearningStatsQuery();

  // Receipt Modal state
  const [selectedPurchaseId, setSelectedPurchaseId] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  // Certificate Modal state
  const [selectedCert, setSelectedCert] = useState(null);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [downloadingCertId, setDownloadingCertId] = useState(null);

  const streakData = streakResponse?.data;
  const badgesData = badgesResponse?.data;
  const statsData = statsResponse?.data;

  const user = userData?.user;
  const enrolledCourses = user?.enrolledCourses || [];
  const publishedCourses = coursesData?.courses || [];
  const purchases = purchasesData?.purchases || [];
  const certificates = certsData?.certificates || [];

  // User display first name
  const firstName = user?.name ? user.name.split(" ")[0] : "Learner";

  return (
    <div className="min-h-screen bg-[#F7FAFF] dark:bg-slate-950 transition-colors">
      {/* Subtle Top Gradient Wash */}
      <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-[#EFF7FF] via-[#F7FAFF]/80 to-transparent dark:from-slate-900/60 dark:via-slate-950/80 dark:to-transparent pointer-events-none" />

      {/* Main Centered Content Container (1200px-1240px) */}
      <main className="relative max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-8">
        {/* ==================================================== */}
        {/* 1. COMPACT WELCOME HEADER */}
        {/* ==================================================== */}
        <section className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[16px] shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-[26px] font-extrabold text-[#0F172A] dark:text-white tracking-tight">
              Welcome back, {firstName}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
              Track your learning progress, stay consistent, and keep building your skills.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => navigate("/my-learning")}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-[#DCE8F5] dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#0F172A] dark:text-white text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>My Learning</span>
            </button>
            <button
              onClick={() => navigate("/course/search?query")}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Courses</span>
            </button>
          </div>
        </section>

        {/* ==================================================== */}
        {/* 2. TOP LAYOUT: LEARNING STREAK + QUICK STATS */}
        {/* ==================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Learning Streak (~67%) */}
          <div className="lg:col-span-8 flex flex-col">
            <LearningStreakCard
              streakData={streakData}
              isLoading={streakLoading}
              onExploreCourses={() => navigate("/my-learning")}
            />
          </div>

          {/* Quick Stats Column (~33%) */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4">
            {/* Stat 1: Enrolled Courses */}
            <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[16px] p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)] flex flex-col justify-between h-[115px] transition-all hover:border-[#BFDBFE] dark:hover:border-blue-500/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400">
                  Enrolled Courses
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800 text-[#2563EB] dark:text-sky-400 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white tracking-tight leading-none">
                  {enrolledCourses.length}
                </p>
                <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-1">
                  Actively learning
                </p>
              </div>
            </div>

            {/* Stat 2: Verified Certificates */}
            <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[16px] p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)] flex flex-col justify-between h-[115px] transition-all hover:border-[#BFDBFE] dark:hover:border-blue-500/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400">
                  Certificates
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white tracking-tight leading-none">
                  {certificates.length}
                </p>
                <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-1">
                  Verified credentials
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================== */}
        {/* 3. MONTHLY LEARNING SUMMARY */}
        {/* ==================================================== */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-white tracking-tight">
              Monthly Learning Summary
            </h2>
            <span className="text-xs text-[#64748B] dark:text-slate-400 font-medium">
              {statsData?.month || new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}
            </span>
          </div>
          <MonthlyStatsCard statsData={statsData} isLoading={statsLoading} />
        </section>

        {/* ==================================================== */}
        {/* 4. MY ENROLLED COURSES */}
        {/* ==================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-white tracking-tight">
                My Enrolled Courses
              </h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                Pick up where you left off.
              </p>
            </div>
            {enrolledCourses.length > 0 && (
              <Link
                to="/my-learning"
                className="text-xs font-semibold text-[#2563EB] dark:text-sky-400 hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {userLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[14px] h-72 animate-pulse"
                />
              ))}
            </div>
          ) : enrolledCourses.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[14px] p-8 text-center max-w-lg mx-auto shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] flex items-center justify-center mx-auto mb-2.5">
                <BookOpen className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-[#0F172A] dark:text-white">
                No enrolled courses yet
              </p>
              <p className="text-xs text-[#64748B] dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Explore our catalog of top-rated courses and start building your skills today.
              </p>
              <button
                onClick={() => navigate("/course/search?query")}
                className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold h-8 px-4 rounded-lg cursor-pointer transition-colors"
              >
                Browse Courses &rarr;
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {enrolledCourses.slice(0, 3).map((course) => (
                <DashboardEnrolledCourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </section>

        {/* ==================================================== */}
        {/* 5. EXPLORE AVAILABLE COURSES */}
        {/* ==================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-white tracking-tight">
                Explore Available Courses
              </h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                Expand your skill stack with new subjects.
              </p>
            </div>
            <Link
              to="/course/search?query"
              className="text-xs font-semibold text-[#2563EB] dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              All Courses <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {coursesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[14px] h-72 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {publishedCourses.slice(0, 3).map((course) => (
                <DashboardExploreCourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </section>

        {/* ==================================================== */}
        {/* 6. VERIFIED CERTIFICATES */}
        {/* ==================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-white tracking-tight flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                My Verified Certificates
              </h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                Official certificates earned after completing your courses.
              </p>
            </div>
            <Link
              to="/verify-certificate"
              className="text-xs font-semibold text-[#2563EB] dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              Verify Credential <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {certsLoading ? (
            <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[14px] p-6 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#2563EB] mx-auto mb-2" />
              <p className="text-xs text-[#64748B]">Loading earned certificates...</p>
            </div>
          ) : certificates.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[14px] p-8 text-center max-w-lg mx-auto shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center mx-auto mb-2.5">
                <Award className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-[#0F172A] dark:text-white">
                No certificates yet
              </p>
              <p className="text-xs text-[#64748B] dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Complete a course and pass the final assessment to earn your first certificate.
              </p>
              <button
                onClick={() => navigate("/course/search?query")}
                className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold h-8 px-4 rounded-lg cursor-pointer transition-colors"
              >
                Explore Courses &rarr;
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {certificates.map((cert) => (
                <div
                  key={cert._id}
                  className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[14px] p-3.5 sm:p-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)] hover:border-[#BFDBFE] dark:hover:border-blue-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Verified
                      </span>
                      <span className="text-[11px] font-bold text-[#2563EB] dark:text-sky-400">
                        Score: {cert.finalScore}%
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-[#0F172A] dark:text-white truncate">
                      {cert.courseName}
                    </h3>
                    <p className="text-[11px] text-[#64748B] dark:text-slate-400 flex items-center gap-1.5 truncate">
                      <span>
                        Issued{" "}
                        {new Date(cert.issueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span>•</span>
                      <span className="font-mono font-medium">{cert.certificateId}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setSelectedCert(cert);
                        setCertModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#DCE8F5] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-[#0F172A] dark:text-white transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>View</span>
                    </button>
                    <button
                      disabled={downloadingCertId === cert.certificateId}
                      onClick={() => {
                        setDownloadingCertId(cert.certificateId);
                        handleDownloadCertificatePdf(cert.certificateId, () =>
                          setDownloadingCertId(null)
                        );
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white transition-all cursor-pointer disabled:opacity-60 shadow-2xs"
                    >
                      {downloadingCertId === cert.certificateId ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ==================================================== */}
        {/* 7. PAYMENT HISTORY & RECEIPTS */}
        {/* ==================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-white tracking-tight flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#2563EB]" />
                Payment History & Receipts
              </h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                Your recent course purchases and receipts.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[14px] overflow-hidden shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
            {purchasesLoading ? (
              <div className="py-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#2563EB] mx-auto mb-2" />
                <p className="text-xs text-[#64748B]">Loading payment records...</p>
              </div>
            ) : purchases.length === 0 ? (
              <div className="py-8 text-center space-y-1">
                <FileText className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-bold text-[#0F172A] dark:text-white">
                  No payment history
                </p>
                <p className="text-xs text-[#64748B] dark:text-slate-400 max-w-sm mx-auto">
                  Transactions and downloadable PDF receipts will appear here once you purchase courses.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] dark:bg-slate-950/60 border-b border-[#E2E8F0] dark:border-slate-800 text-[#64748B] dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Transaction</th>
                        <th className="py-3 px-4">Course</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] dark:divide-slate-800 text-[13px]">
                      {purchases.map((purchase) => (
                        <tr
                          key={purchase._id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3.5 px-4 font-mono text-xs font-semibold text-[#0F172A] dark:text-slate-200">
                            {purchase.transactionId || purchase._id.slice(-8).toUpperCase()}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-[#0F172A] dark:text-white max-w-[240px] truncate">
                            {purchase.courseId?.courseTitle || "Course"}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-[#64748B] dark:text-slate-400 whitespace-nowrap">
                            {new Date(purchase.paidAt || purchase.createdAt).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric", year: "numeric" }
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#0F172A] dark:text-white">
                            ₹{purchase.amount?.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                              Paid
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedPurchaseId(purchase._id);
                                  setReceiptModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-[#2563EB] dark:hover:text-sky-400 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>View</span>
                              </button>
                              <button
                                onClick={async () => {
                                  setDownloadingId(purchase._id);
                                  await handleDownloadPdf(purchase._id, purchase.receiptNumber);
                                  setDownloadingId(null);
                                }}
                                disabled={downloadingId === purchase._id}
                                className="p-1 text-slate-500 hover:text-[#2563EB] rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                                title="Download Receipt PDF"
                              >
                                {downloadingId === purchase._id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Download className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View (No horizontal scroll) */}
                <div className="block sm:hidden divide-y divide-[#E2E8F0] dark:divide-slate-800">
                  {purchases.map((purchase) => (
                    <div key={purchase._id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-[#0F172A] dark:text-white truncate">
                            {purchase.courseId?.courseTitle || "Course"}
                          </p>
                          <p className="font-mono text-[10px] text-[#64748B] dark:text-slate-400">
                            ID: {purchase.transactionId || purchase._id.slice(-8).toUpperCase()}
                          </p>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          Paid
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-[#64748B] dark:text-slate-400">
                          {new Date(purchase.paidAt || purchase.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" }
                          )}
                        </span>
                        <span className="font-bold text-[#0F172A] dark:text-white">
                          ₹{purchase.amount?.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => {
                            setSelectedPurchaseId(purchase._id);
                            setReceiptModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded border border-[#DCE8F5] text-slate-700 dark:text-slate-200"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={async () => {
                            setDownloadingId(purchase._id);
                            await handleDownloadPdf(purchase._id, purchase.receiptNumber);
                            setDownloadingId(null);
                          }}
                          disabled={downloadingId === purchase._id}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-[#2563EB] text-white"
                        >
                          {downloadingId === purchase._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                          <span>Receipt</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      {/* Modals Preserved */}
      {selectedPurchaseId && (
        <ReceiptModal
          purchaseId={selectedPurchaseId}
          isOpen={receiptModalOpen}
          onOpenChange={setReceiptModalOpen}
        />
      )}

      <CertificateModal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        certificate={selectedCert}
      />
    </div>
  );
};

export default StudentDashboard;

/**
 * DashboardEnrolledCourseCard:
 * Compact enrolled card for dashboard with "Continue Learning →" link.
 */
const DashboardEnrolledCourseCard = ({ course }) => {
  const navigate = useNavigate();

  return (
    <div className="group bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[14px] overflow-hidden shadow-[0_4px_14px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 hover:border-[#BFDBFE] dark:hover:border-blue-500/60 hover:shadow-[0_8px_20px_rgba(37,99,235,0.08)] transition-all duration-200 flex flex-col justify-between">
      <div>
        <Link
          to={`/course-progress/${course._id}`}
          className="block relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800"
        >
          <img
            src={
              course?.courseThumbnail ||
              "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"
            }
            alt={course?.courseTitle || "Course thumbnail"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </Link>

        <div className="p-3.5 flex flex-col space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#2563EB] dark:text-sky-400">
            {course?.category || "Course"}
          </span>

          <Link to={`/course-progress/${course._id}`}>
            <h3 className="text-[14px] sm:text-[15px] font-bold text-[#0F172A] dark:text-white leading-[1.35] line-clamp-2 group-hover:text-[#2563EB] dark:group-hover:text-sky-400 transition-colors min-h-[38px]">
              {course?.courseTitle || "Masterclass"}
            </h3>
          </Link>

          <div className="flex items-center gap-2 pt-1">
            <Avatar className="w-5 h-5 rounded-full ring-1 ring-slate-200 dark:ring-slate-700 shrink-0">
              <AvatarImage
                src={course?.creator?.photoURL || "https://github.com/shadcn.png"}
                alt={course?.creator?.name || "Instructor"}
              />
              <AvatarFallback className="text-[9px] font-semibold bg-blue-50 text-[#2563EB]">
                {course?.creator?.name?.substring(0, 2).toUpperCase() || "IN"}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium text-[#334155] dark:text-slate-300 truncate">
              {course?.creator?.name || "Instructor"}
            </span>
          </div>
        </div>
      </div>

      <div className="p-3.5 pt-2 border-t border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between">
        <span className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium">
          In progress
        </span>
        <button
          onClick={() => navigate(`/course-progress/${course._id}`)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] dark:text-sky-400 hover:text-blue-700 dark:hover:text-sky-300 transition-colors cursor-pointer"
        >
          <span>Continue Learning</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

/**
 * DashboardExploreCourseCard:
 * Compact discovery card for dashboard with subtle price + "View Course →".
 */
const DashboardExploreCourseCard = ({ course }) => {
  const navigate = useNavigate();

  return (
    <div className="group bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[14px] overflow-hidden shadow-[0_4px_14px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 hover:border-[#BFDBFE] dark:hover:border-blue-500/60 hover:shadow-[0_8px_20px_rgba(37,99,235,0.08)] transition-all duration-200 flex flex-col justify-between">
      <div>
        <Link
          to={`/course-detail/${course._id}`}
          className="block relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800"
        >
          <img
            src={
              course?.courseThumbnail ||
              "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"
            }
            alt={course?.courseTitle || "Course thumbnail"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </Link>

        <div className="p-3.5 flex flex-col space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#2563EB] dark:text-sky-400">
              {course?.category || "Course"}
            </span>
            <div className="flex items-center gap-1 text-[11px]">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-bold text-[#0F172A] dark:text-slate-200">4.8</span>
            </div>
          </div>

          <Link to={`/course-detail/${course._id}`}>
            <h3 className="text-[14px] sm:text-[15px] font-bold text-[#0F172A] dark:text-white leading-[1.35] line-clamp-2 group-hover:text-[#2563EB] dark:group-hover:text-sky-400 transition-colors min-h-[38px]">
              {course?.courseTitle || "Masterclass"}
            </h3>
          </Link>

          <div className="flex items-center gap-2 pt-1">
            <Avatar className="w-5 h-5 rounded-full ring-1 ring-slate-200 dark:ring-slate-700 shrink-0">
              <AvatarImage
                src={course?.creator?.photoURL || "https://github.com/shadcn.png"}
                alt={course?.creator?.name || "Instructor"}
              />
              <AvatarFallback className="text-[9px] font-semibold bg-blue-50 text-[#2563EB]">
                {course?.creator?.name?.substring(0, 2).toUpperCase() || "IN"}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium text-[#334155] dark:text-slate-300 truncate">
              {course?.creator?.name || "Instructor"}
            </span>
          </div>
        </div>
      </div>

      <div className="p-3.5 pt-2 border-t border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between">
        <span className="text-[15px] font-bold text-[#2563EB] dark:text-sky-400">
          ₹{course?.coursePrice ?? 499}
        </span>
        <button
          onClick={() => navigate(`/course-detail/${course._id}`)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] dark:text-sky-400 hover:text-blue-700 dark:hover:text-sky-300 transition-colors cursor-pointer"
        >
          <span>View Course</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};
