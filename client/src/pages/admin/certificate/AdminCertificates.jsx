import React, { useState } from "react";
import { useGetAllAdminCertificatesQuery } from "@/features/api/certificateApi";
import CertificateModal, { handleDownloadCertificatePdf } from "@/components/CertificateModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Award,
  Download,
  Eye,
  ExternalLink,
  ShieldCheck,
  Loader2,
  Search,
  Sparkles,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";
import { Link } from "react-router-dom";

const AdminCertificates = () => {
  const { data, isLoading } = useGetAllAdminCertificatesQuery();
  const [selectedCert, setSelectedCert] = useState(null);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const certificates = data?.certificates || [];

  const filteredCerts = certificates.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      (c.certificateId || "").toLowerCase().includes(term) ||
      (c.studentName || "").toLowerCase().includes(term) ||
      (c.courseName || "").toLowerCase().includes(term)
    );
  });

  const avgScore =
    certificates.length > 0
      ? Math.round(certificates.reduce((sum, c) => sum + (c.finalScore || 0), 0) / certificates.length)
      : 0;

  if (isLoading) {
    return <CertificatesSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* ==================================================== */}
      {/* 1. TOP HEADER */}
      {/* ==================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-sky-300 border border-blue-200/60 dark:border-blue-800 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
            <span>Institutional Credentials</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
              Issued Certificates Registry
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-sky-400 border border-blue-200/60 dark:border-blue-800">
              {certificates.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Complete registry of course completions, exam evaluation scores, and cryptographic credentials.
          </p>
        </div>

        <Link to="/verify-certificate">
          <Button
            variant="outline"
            className="rounded-xl border-[#DCEAF7] dark:border-slate-800 text-xs font-semibold h-10 px-4 gap-1.5 cursor-pointer shadow-2xs self-start sm:self-auto"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Public Verification Portal</span>
          </Button>
        </Link>
      </div>

      {/* ==================================================== */}
      {/* 2. STATS PILLS & SEARCH */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{certificates.length}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Issued Certificates</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{avgScore}%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Average Final Score</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              {new Set(certificates.map((c) => c.studentId || c.studentName)).size}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Unique Certified Students</p>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by student name, course, or ID..."
          className="pl-9 h-9 text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs"
        />
      </div>

      {/* ==================================================== */}
      {/* 3. CERTIFICATES TABLE CARD */}
      {/* ==================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {filteredCerts.length === 0 ? (
          <div className="py-16 text-center max-w-md mx-auto space-y-3 px-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {searchTerm ? "No certificates match your search" : "No certificates issued yet"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {searchTerm
                ? "Check your spelling or clear search filters."
                : "Certificates are automatically generated and cryptographically signed when students achieve 100% course progress and pass final assessment quizzes."}
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="text-xs font-semibold rounded-xl h-8 px-3"
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/75 dark:bg-slate-800/50">
                <TableRow className="border-b border-[#E2E8F0] dark:border-slate-800">
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Certificate ID
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Student Name
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Course Name
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                    Final Score
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                    Issue Date
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCerts.map((c) => (
                  <TableRow
                    key={c._id}
                    className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <TableCell className="py-3.5 font-mono text-xs font-bold text-blue-600 dark:text-sky-400">
                      {c.certificateId}
                    </TableCell>
                    <TableCell className="py-3.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {c.studentName}
                    </TableCell>
                    <TableCell className="py-3.5 text-xs text-slate-700 dark:text-slate-300 font-medium max-w-[220px] truncate">
                      {c.courseName}
                    </TableCell>
                    <TableCell className="py-3.5 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                        {c.finalScore}%
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 text-center text-xs text-slate-500 dark:text-slate-400">
                      {new Date(c.issueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedCert(c);
                            setCertModalOpen(true);
                          }}
                          className="h-8 text-xs font-semibold hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-sky-400 cursor-pointer gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={downloadingId === c.certificateId}
                          onClick={() => {
                            setDownloadingId(c.certificateId);
                            handleDownloadCertificatePdf(c.certificateId, () => setDownloadingId(null));
                          }}
                          className="h-8 text-xs font-semibold rounded-lg border-slate-200 dark:border-slate-700 hover:bg-slate-50 cursor-pointer gap-1"
                        >
                          {downloadingId === c.certificateId ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                          <span>PDF</span>
                        </Button>
                        <Link
                          to={`/verify-certificate/${c.certificateId}`}
                          target="_blank"
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 transition-colors"
                          title="Open Public Verification Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        certificate={selectedCert}
      />
    </div>
  );
};

export default AdminCertificates;

function CertificatesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32 rounded-full" />
        <Skeleton className="h-8 w-56 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );
}
