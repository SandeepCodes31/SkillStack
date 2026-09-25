import React, { useState } from "react";
import { useGetAllPurchasesQuery } from "@/features/api/purchaseApi";
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
import ReceiptModal, { handleDownloadPdf } from "@/components/ReceiptModal";
import {
  CreditCard,
  Search,
  Download,
  FileText,
  Loader2,
  RefreshCw,
  IndianRupee,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const AdminPayments = () => {
  const { data, isLoading, isError, refetch } = useGetAllPurchasesQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPurchaseId, setSelectedPurchaseId] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const purchases = data?.purchases || [];

  const filteredPurchases = purchases.filter((p) => {
    const term = searchTerm.toLowerCase();
    const courseTitle = p.courseId?.courseTitle?.toLowerCase() || "";
    const buyerName = p.userId?.name?.toLowerCase() || "";
    const buyerEmail = p.userId?.email?.toLowerCase() || "";
    const txnId = (p.transactionId || "").toLowerCase();
    const receiptNum = (p.receiptNumber || "").toLowerCase();
    return (
      courseTitle.includes(term) ||
      buyerName.includes(term) ||
      buyerEmail.includes(term) ||
      txnId.includes(term) ||
      receiptNum.includes(term)
    );
  });

  const totalRevenue = purchases
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const completedCount = purchases.filter((p) => p.status === "completed").length;
  const pendingCount = purchases.filter((p) => p.status !== "completed").length;

  const onOpenReceipt = (purchaseId) => {
    setSelectedPurchaseId(purchaseId);
    setReceiptModalOpen(true);
  };

  const onDownloadPdf = async (purchase) => {
    setDownloadingId(purchase._id);
    await handleDownloadPdf(purchase._id, purchase.receiptNumber);
    setDownloadingId(null);
  };

  if (isLoading) {
    return <PaymentsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* ==================================================== */}
      {/* 1. TOP HEADER & REFRESH BUTTON */}
      {/* ==================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-sky-300 border border-blue-200/60 dark:border-blue-800 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
            <span>Financial & Invoicing</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
              Payments & Transactions
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-sky-400 border border-blue-200/60 dark:border-blue-800">
              {purchases.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Audit student course transactions, verified gateway payments, and downloadable tax receipts.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="rounded-xl border-[#DCEAF7] dark:border-slate-800 text-xs font-semibold h-10 px-4 cursor-pointer gap-2 self-start sm:self-auto shadow-2xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Data</span>
        </Button>
      </div>

      {/* ==================================================== */}
      {/* 2. STATS OVERVIEW CARDS */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Completed Purchases
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-white mt-1">
              {completedCount}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Successful transactions</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Gross Platform Revenue
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Verified received funds</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Pending / Other Orders
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-600 dark:text-slate-300 mt-1">
              {pendingCount}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Incomplete or pending</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 3. SEARCH & TABLE CARD */}
      {/* ==================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {/* Card Header & Search bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              All Transaction Records
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredPurchases.length} of {purchases.length} purchases
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search buyer, course, txn..."
              className="pl-9 h-9 text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
            />
          </div>
        </div>

        {isError ? (
          <div className="text-center py-12 text-rose-500 text-xs font-semibold">
            Failed to load transaction data. Verify admin role authorization.
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="py-16 text-center max-w-md mx-auto space-y-3 px-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {searchTerm ? "No transactions match your search" : "No transactions recorded yet"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {searchTerm
                ? "Try searching for a different buyer name, email, or transaction ID."
                : "Transactions will appear here automatically when students enroll in courses."}
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
                    Transaction ID
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Buyer
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Course Title
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Amount
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                    Date
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.map((purchase) => (
                  <TableRow
                    key={purchase._id}
                    className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <TableCell className="py-3.5 font-mono text-xs font-bold text-blue-600 dark:text-sky-400">
                      {purchase.transactionId || purchase._id.slice(-8).toUpperCase()}
                    </TableCell>
                    <TableCell className="py-3.5">
                      <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {purchase.userId?.name || "Student"}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[160px]">
                        {purchase.userId?.email}
                      </p>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white max-w-[200px] truncate">
                        {purchase.courseId?.courseTitle || "Course"}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Instructor: {purchase.courseId?.creator?.name || "SkillStack Mentor"}
                      </p>
                    </TableCell>
                    <TableCell className="py-3.5 font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white">
                      ₹{purchase.amount?.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="py-3.5 text-center">
                      {purchase.status === "completed" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          COMPLETED
                        </span>
                      ) : purchase.status === "pending" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                          <Clock className="w-2.5 h-2.5" />
                          PENDING
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">
                          {purchase.status?.toUpperCase() || "FAILED"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-3.5 text-center text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(purchase.paidAt || purchase.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onOpenReceipt(purchase._id)}
                          className="h-8 px-2.5 text-xs font-semibold hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-sky-400 cursor-pointer gap-1"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>Receipt</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDownloadPdf(purchase)}
                          disabled={downloadingId === purchase._id}
                          className="h-8 px-2.5 text-xs font-semibold rounded-lg border-slate-200 dark:border-slate-700 hover:bg-slate-50 cursor-pointer gap-1"
                        >
                          {downloadingId === purchase._id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Download className="h-3.5 w-3.5" />
                          )}
                          <span>PDF</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {selectedPurchaseId && (
        <ReceiptModal
          purchaseId={selectedPurchaseId}
          isOpen={receiptModalOpen}
          onOpenChange={setReceiptModalOpen}
        />
      )}
    </div>
  );
};

export default AdminPayments;

function PaymentsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32 rounded-full" />
        <Skeleton className="h-8 w-56 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );
}
