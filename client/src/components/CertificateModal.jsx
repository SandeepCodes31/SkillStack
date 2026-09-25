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
import { Award, Download, ExternalLink, CheckCircle2, Copy, Check, School, ShieldCheck, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/config/api.config";
import { toast } from "sonner";

export const handleDownloadCertificatePdf = async (certificateId, setDownloading) => {
  try {
    if (setDownloading) setDownloading(true);
    const response = await fetch(
      `${API_BASE_URL}/api/v1/certificate/${certificateId}/pdf`,
      { credentials: "include" }
    );
    if (!response.ok) {
      throw new Error("Failed to generate certificate PDF.");
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SkillStack-Certificate-${certificateId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    toast.success("Certificate PDF downloaded successfully!");
  } catch (error) {
    console.error("PDF download error:", error);
    toast.error("Could not download certificate PDF.");
  } finally {
    if (setDownloading) setDownloading(false);
  }
};

const CertificateModal = ({ isOpen, onClose, certificate }) => {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!certificate) return null;

  const dateFormatted = new Date(certificate.issueDate || certificate.createdAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const verificationUrl = `${window.location.origin}/verify-certificate/${certificate.certificateId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    toast.success("Verification link copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border border-border/80 rounded-2xl bg-card">
        {/* Decorative Top Accent */}
        <div className="h-2 bg-gradient-to-r from-amber-500 via-blue-600 to-amber-500" />

        <div className="p-6 sm:p-8 space-y-6">
          {/* Certificate Frame Preview */}
          <div className="relative p-6 sm:p-8 rounded-xl border-4 border-slate-900 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 shadow-md">
            {/* Inner Gold Border */}
            <div className="absolute inset-2 border-2 border-amber-500/60 rounded pointer-events-none" />

            <div className="relative text-center space-y-4">
              {/* Header Badge */}
              <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-500 font-bold text-xs uppercase tracking-widest">
                <School className="w-4 h-4" />
                <span>SkillStack Learning Academy</span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-wide">
                  CERTIFICATE OF COMPLETION
                </h2>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
                  This is proudly presented to
                </p>
              </div>

              {/* Student Name */}
              <div className="py-1">
                <h3 className="text-2xl sm:text-4xl font-black text-blue-700 dark:text-blue-400 tracking-tight">
                  {certificate.studentName}
                </h3>
                <div className="w-48 h-0.5 bg-muted-foreground/30 mx-auto mt-2" />
              </div>

              {/* Narrative */}
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                for successfully mastering all modules, fulfilling 100% of coursework, and passing the comprehensive final assessment for:
              </p>

              {/* Course Name */}
              <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                "{certificate.courseName}"
              </h4>

              {/* Score & Instructor Badges */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800 text-xs py-1 px-3">
                  Score: {certificate.finalScore}% (Passed)
                </Badge>
                <Badge variant="outline" className="text-xs py-1 px-3">
                  Instructor: {certificate.instructorName}
                </Badge>
                <Badge variant="outline" className="text-xs py-1 px-3">
                  Issued: {dateFormatted}
                </Badge>
              </div>

              {/* Footer Credentials */}
              <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Credential</span>
                </div>
                <div>
                  ID: <span className="font-mono font-bold text-foreground">{certificate.certificateId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="w-full sm:w-auto text-xs cursor-pointer gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Link Copied" : "Copy Verification Link"}</span>
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="w-full sm:w-auto text-xs cursor-pointer"
              >
                Close
              </Button>
              <Button
                size="sm"
                disabled={downloading}
                onClick={() => handleDownloadCertificatePdf(certificate.certificateId, setDownloading)}
                className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold cursor-pointer gap-2"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download Official PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CertificateModal;
