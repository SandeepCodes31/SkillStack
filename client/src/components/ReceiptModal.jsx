import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useGetReceiptQuery } from "@/features/api/purchaseApi";
import { Download, Loader2, CheckCircle, School } from "lucide-react";
import { API_BASE_URL } from "@/config/api.config";
import { toast } from "sonner";

export const handleDownloadPdf = async (purchaseId, receiptNumber, sessionId = "") => {
  try {
    const queryParam = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : "";
    const response = await fetch(
      `${API_BASE_URL}/api/v1/purchase/receipt/${purchaseId}/pdf${queryParam}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      throw new Error(errJson?.message || "Failed to download receipt PDF");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SkillStack-Receipt-${receiptNumber || purchaseId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    toast.success("Receipt PDF downloaded successfully");
  } catch (error) {
    console.error("PDF download error:", error);
    toast.error(error.message || "Could not download receipt PDF");
  }
};

const ReceiptModal = ({ purchaseId, isOpen, onOpenChange, initialReceipt = null, sessionId = "" }) => {
  const [downloading, setDownloading] = useState(false);
  const { data, isLoading } = useGetReceiptQuery(
    sessionId ? { purchaseId, sessionId } : purchaseId,
    {
      skip: !isOpen || !purchaseId || Boolean(initialReceipt),
    }
  );

  const receipt = initialReceipt || data?.receipt;

  const onDownloadClick = async () => {
    if (!purchaseId) return;
    setDownloading(true);
    await handleDownloadPdf(purchaseId, receipt?.receiptNumber, sessionId);
    setDownloading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 shadow-xl rounded-xl">
        <DialogHeader className="border-b border-gray-200 dark:border-gray-800 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <School className="h-6 w-6 text-primary" />
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight">SkillStack Receipt</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Official Electronic Payment Confirmation
                </DialogDescription>
              </div>
            </div>
            {receipt && (
              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1 text-xs">
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                PAID
              </Badge>
            )}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Fetching receipt details...</p>
          </div>
        ) : !receipt ? (
          <div className="text-center py-8">
            <p className="text-sm text-red-500 font-medium">Receipt information could not be loaded.</p>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 dark:bg-[#1A1A1A] p-4 rounded-lg border border-gray-100 dark:border-gray-800 text-xs">
              <div>
                <span className="text-muted-foreground block font-medium">Receipt Number</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{receipt.receiptNumber}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Transaction ID</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">{receipt.transactionId}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Payment Date</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {new Date(receipt.date).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Buyer Details */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Buyer Details
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50/50 dark:bg-[#181818] p-3 rounded-lg border border-gray-100 dark:border-gray-800/80">
                <div>
                  <span className="text-xs text-muted-foreground block">Name</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{receipt.buyer?.name}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Email</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 break-all">{receipt.buyer?.email}</span>
                </div>
              </div>
            </div>

            {/* Course Details */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Course Details
              </h4>
              <div className="space-y-2 text-sm bg-gray-50/50 dark:bg-[#181818] p-3 rounded-lg border border-gray-100 dark:border-gray-800/80">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-muted-foreground block">Course Name</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{receipt.course?.title}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {receipt.course?.category}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <span className="text-xs text-muted-foreground block">Instructor</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{receipt.course?.instructor}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Course ID</span>
                    <span className="font-mono text-xs text-gray-700 dark:text-gray-300 truncate block">
                      {receipt.course?.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Payment Summary
              </h4>
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                <div className="flex justify-between items-center p-3 text-sm bg-gray-50 dark:bg-[#1A1A1A]">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Course Enrollment</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    ₹{receipt.payment?.amount?.toLocaleString("en-IN")}
                  </span>
                </div>
                <Separator />
                <div className="p-3 space-y-1.5 text-xs text-muted-foreground bg-white dark:bg-[#141212]">
                  <div className="flex justify-between">
                    <span>Payment Method</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">{receipt.payment?.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stripe Reference</span>
                    <span className="font-mono text-[11px] text-gray-700 dark:text-gray-300">
                      {receipt.payment?.stripePaymentIntentId || receipt.payment?.stripeSessionId}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50/70 dark:bg-blue-950/30 border-t border-blue-100 dark:border-blue-900/40">
                  <span className="text-sm font-bold text-blue-900 dark:text-blue-300">Total Paid</span>
                  <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
                    ₹{receipt.payment?.amount?.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={onDownloadClick}
                disabled={downloading}
                className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {downloading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptModal;
