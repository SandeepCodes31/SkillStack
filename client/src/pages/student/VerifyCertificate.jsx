import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLazyVerifyCertificateQuery } from "@/features/api/certificateApi";
import { handleDownloadCertificatePdf } from "@/components/CertificateModal";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Search,
  Award,
  Download,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  BookOpen,
  Loader2,
  Copy,
  Check,
  Lock,
  GraduationCap,
  X,
} from "lucide-react";
import { toast } from "sonner";

const VerifyCertificate = () => {
  const { certificateId: paramId } = useParams();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(paramId || "");
  const [downloading, setDownloading] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const [triggerVerify, { data, isLoading, isFetching, isError, error }] =
    useLazyVerifyCertificateQuery();

  // If a certificateId is present in URL params, auto-verify on load
  useEffect(() => {
    if (paramId) {
      setSearchInput(paramId);
      triggerVerify(paramId);
    }
  }, [paramId, triggerVerify]);

  const handleSearch = (e) => {
    e?.preventDefault();
    const cleanId = searchInput.trim();
    if (!cleanId) {
      toast.error("Please enter a Credential ID.");
      return;
    }
    triggerVerify(cleanId);
    navigate(`/verify-certificate/${cleanId}`, { replace: true });
  };

  const handleCopy = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === "id") {
      setCopiedId(true);
      toast.success("Credential ID copied to clipboard!");
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedCode(true);
      toast.success("Verification code copied to clipboard!");
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const cert = data?.certificate;
  const isBusy = isLoading || isFetching;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#F7FAFF] dark:bg-slate-950 transition-colors overflow-hidden">
      {/* Background Subtle Gradient Wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#EFF7FF] via-[#F7FAFF] to-white dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-950 pointer-events-none" />

      {/* Soft Blurred Background Ambient Blobs (barely visible) */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[650px] h-[320px] bg-blue-400/8 dark:bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -top-10 right-10 w-72 h-72 bg-sky-300/10 dark:bg-sky-500/5 blur-[90px] rounded-full pointer-events-none" />

      {/* Main Content Container */}
      <main className="relative max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-16">
        {/* HERO SECTION */}
        <section className="max-w-[700px] mx-auto text-center space-y-3 sm:space-y-4">
          {/* Verified Icon Container */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 text-[#2563EB] dark:text-sky-400 shadow-xs mb-1">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>

          {/* Eyebrow Pill */}
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800 text-[11px] font-semibold text-[#2563EB] dark:text-sky-400 uppercase tracking-wider">
              <Lock className="w-3 h-3" />
              Credential Verification
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#0F172A] dark:text-white tracking-tight leading-[1.2]">
            Verify Your{" "}
            <span className="text-[#2563EB] dark:text-sky-400">
              SkillStack Credential
            </span>
          </h1>

          {/* Description */}
          <p className="text-[15px] sm:text-[16px] text-[#64748B] dark:text-slate-400 max-w-[600px] mx-auto leading-relaxed">
            Confirm the authenticity of SkillStack certificates and credentials
            issued to learners.
          </p>
        </section>

        {/* VERIFICATION SEARCH CARD */}
        <section className="max-w-[800px] mx-auto mt-8 sm:mt-10">
          <div className="relative bg-white dark:bg-slate-900 border border-[#DCE8F5] dark:border-slate-800 rounded-[18px] shadow-[0_10px_35px_rgba(37,99,235,0.08)] dark:shadow-none p-6 sm:p-7 overflow-hidden transition-all">
            {/* Very Subtle Decorative Shield in Background (low opacity) */}
            <ShieldCheck className="absolute -right-8 -bottom-8 w-44 h-44 text-blue-600/[0.03] dark:text-blue-400/[0.02] pointer-events-none select-none" />

            {/* Card Header */}
            <div className="space-y-1 text-left">
              <h2 className="text-base sm:text-[18px] font-semibold text-[#0F172A] dark:text-white">
                Enter Credential ID
              </h2>
              <p className="text-[13px] sm:text-sm text-[#64748B] dark:text-slate-400">
                Enter the credential ID shown on your SkillStack certificate.
              </p>
            </div>

            {/* Search Input Row */}
            <form onSubmit={handleSearch} className="mt-5 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <label htmlFor="credentialIdInput" className="sr-only">
                    Credential ID
                  </label>
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
                  <input
                    id="credentialIdInput"
                    type="text"
                    placeholder="e.g. SKILL-2026-8F42A91C"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    disabled={isBusy}
                    className="w-full h-12 sm:h-[50px] pl-10 pr-9 border border-[#D8E3F0] dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-sm font-medium text-[#0F172A] dark:text-white placeholder:text-slate-400 placeholder:normal-case focus:border-[#2563EB] focus:ring-3 focus:ring-blue-500/10 focus:outline-none transition-all uppercase tracking-wide disabled:opacity-60"
                  />
                  {searchInput && !isBusy && (
                    <button
                      type="button"
                      onClick={() => setSearchInput("")}
                      aria-label="Clear credential ID"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isBusy}
                  className="h-12 sm:h-[50px] px-6 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-blue-800 text-white font-semibold text-sm transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-70 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2 shadow-xs shrink-0"
                >
                  {isBusy ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
                      <span>Verify Credential</span>
                    </>
                  )}
                </button>
              </div>

              {/* Helper Text */}
              <p className="text-xs text-[#64748B] dark:text-slate-400 pt-0.5 text-left">
                Your credential ID can be found on your SkillStack certificate. Credential IDs are case-sensitive.
              </p>
            </form>
          </div>

          {/* Trust / Security Indicator */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-[#64748B] dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Secure credential verification
              </span>
            </div>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span>Verify certificates directly through SkillStack.</span>
          </div>
        </section>

        {/* VERIFICATION RESULT STATES */}
        <section aria-live="polite" className="max-w-[800px] mx-auto">
          {/* Loading State */}
          {isBusy && (
            <div className="mt-6 bg-white dark:bg-slate-900 border border-[#DCE8F5] dark:border-slate-800 rounded-[18px] p-8 text-center shadow-xs space-y-3 animate-in fade-in duration-200">
              <Loader2 className="w-7 h-7 animate-spin text-[#2563EB] mx-auto" />
              <p className="text-sm font-semibold text-[#0F172A] dark:text-white">
                Verifying Credential...
              </p>
              <p className="text-xs text-[#64748B] dark:text-slate-400 max-w-sm mx-auto">
                Validating cryptographic record with the official SkillStack registry.
              </p>
            </div>
          )}

          {/* Invalid / Not Found State */}
          {isError && !isBusy && (
            <div className="mt-6 bg-red-50/70 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/40 rounded-[18px] p-6 sm:p-8 text-center shadow-xs animate-in fade-in duration-200">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-red-700 dark:text-red-400">
                Credential Not Found
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 max-w-md mx-auto mt-1.5 leading-relaxed">
                {error?.data?.message ||
                  "We couldn't verify this credential. Please check the credential ID and try again."}
              </p>
            </div>
          )}

          {/* Successfully Verified Result Card */}
          {cert && !isBusy && (
            <div className="mt-6 bg-[#F0FDF4] dark:bg-emerald-950/20 border border-[#BBF7D0] dark:border-emerald-900/60 rounded-[18px] overflow-hidden shadow-[0_10px_35px_rgba(34,197,94,0.06)] dark:shadow-none transition-all animate-in fade-in duration-300">
              {/* Card Header Banner */}
              <div className="bg-emerald-600 dark:bg-emerald-700 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base leading-tight">
                      Credential Verified
                    </h3>
                    <p className="text-xs text-emerald-100">
                      This credential has been successfully verified.
                    </p>
                  </div>
                </div>
                <Badge className="bg-white/20 hover:bg-white/20 text-white border-transparent text-xs font-semibold px-2.5 py-1 w-fit">
                  Active & Authentic
                </Badge>
              </div>

              {/* Card Body Details */}
              <div className="p-6 sm:p-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs space-y-6">
                {/* 2-Column Responsive Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  {/* Credential Holder */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Credential Holder
                    </span>
                    <p className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white">
                      {cert.studentName || "Learner"}
                    </p>
                  </div>

                  {/* Course */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      Course
                    </span>
                    <p className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white">
                      {cert.courseName || "SkillStack Masterclass"}
                    </p>
                  </div>

                  {/* Academic Standing */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-slate-400" />
                      Academic Standing
                    </span>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-sm font-bold text-[#2563EB] dark:text-sky-400">
                        Score: {cert.finalScore ?? 100}%
                      </span>
                      <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-sky-400 border border-blue-200/80 dark:border-blue-800">
                        Passed Final Exam
                      </span>
                    </div>
                  </div>

                  {/* Faculty Instructor */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                      Faculty Instructor
                    </span>
                    <p className="text-sm sm:text-base font-medium text-[#0F172A] dark:text-white">
                      {cert.instructorName || "SkillStack Faculty"}
                    </p>
                  </div>

                  {/* Issued Date */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Issued
                    </span>
                    <p className="text-sm font-medium text-[#0F172A] dark:text-white">
                      {cert.issueDate
                        ? new Date(cert.issueDate).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "Verified"}
                    </p>
                  </div>

                  {/* Credential ID with Copy Button */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                      Credential ID
                    </span>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="font-mono text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                        {cert.certificateId}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(cert.certificateId, "id")}
                        aria-label="Copy Credential ID"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] dark:text-sky-400 hover:text-blue-700 dark:hover:text-sky-300 p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        {copiedId ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Verification Code & Download Verified PDF */}
                <div className="pt-5 border-t border-[#E2E8F0] dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-slate-400">
                    <span>Verification Code:</span>
                    <span className="font-mono font-bold text-[#0F172A] dark:text-white">
                      {cert.verificationCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(cert.verificationCode, "code")}
                      aria-label="Copy Verification Code"
                      className="text-[#2563EB] dark:text-sky-400 hover:text-blue-700 dark:hover:text-sky-300 p-1 rounded transition-colors cursor-pointer"
                    >
                      {copiedCode ? (
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={downloading}
                    onClick={() =>
                      handleDownloadCertificatePdf(cert.certificateId, setDownloading)
                    }
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-blue-800 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-60"
                  >
                    {downloading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Downloading PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Verified PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default VerifyCertificate;
