import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { userLoggedIn } from "@/features/authSlice";
import { useLoadUserQuery } from "@/features/api/authApi";
import { useVerifySessionQuery } from "@/features/api/purchaseApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ReceiptModal, { handleDownloadPdf } from "@/components/ReceiptModal";
import {
  CheckCircle2,
  Loader2,
  BookOpen,
  FileText,
  Download,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const sessionId = searchParams.get("session_id");
  const courseIdParam = searchParams.get("course_id");

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const { refetch: refetchUser } = useLoadUserQuery();

  const { data, isLoading, isError, error, refetch } = useVerifySessionQuery(sessionId, {
    skip: !sessionId,
    pollingInterval: 3000, // Poll every 3s until verified
  });

  const isConfirmed = data?.success && data?.status === "completed";
  const purchase = data?.purchase;
  const course = data?.course || purchase?.courseId;
  const targetCourseId = course?._id || courseIdParam;

  useEffect(() => {
    if (isConfirmed) {
      if (data?.user) {
        dispatch(userLoggedIn({ user: data.user }));
      }
      refetchUser();
    }
  }, [isConfirmed, data, dispatch, refetchUser]);

  const onDownloadClick = async () => {
    if (!purchase?._id) return;
    setDownloadingPdf(true);
    await handleDownloadPdf(purchase._id, purchase.receiptNumber, sessionId);
    setDownloadingPdf(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full">
        <Card className="shadow-lg border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141212] overflow-hidden">
          {/* Header Banner */}
          <div className="bg-emerald-600 dark:bg-emerald-700 text-white p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="inline-flex p-3 rounded-full bg-white/20 mb-3 backdrop-blur-xs">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Payment Successful!</h1>
            <p className="text-emerald-100 text-sm mt-1 max-w-sm mx-auto">
              Your course enrollment is complete and ready for you.
            </p>
          </div>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {isLoading && !isConfirmed ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground">
                  Confirming your payment and setting up your learning workspace...
                </p>
              </div>
            ) : isError ? (
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-sm flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Payment verification in progress</p>
                  <p className="text-xs">
                    Your Stripe payment went through! The server is finalizing database records.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2 text-xs">
                    Check Status Again
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Course Summary Card */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-gray-50/70 dark:bg-[#1A1A1A]/70 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground block font-medium">Purchased Course</span>
                      <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                        {course?.courseTitle || "SkillStack Course"}
                      </h3>
                      {course?.creator?.name && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Instructor: <span className="font-medium text-gray-800 dark:text-gray-200">{course.creator.name}</span>
                        </p>
                      )}
                    </div>
                    <Badge className="bg-emerald-600 text-white shrink-0 text-xs">
                      Enrolled
                    </Badge>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground block">Amount Paid</span>
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">
                        ₹{purchase?.amount?.toLocaleString("en-IN") || course?.coursePrice}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Transaction ID</span>
                      <span className="font-mono text-gray-900 dark:text-white font-medium truncate block">
                        {purchase?.transactionId || "Verified"}
                      </span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-muted-foreground block">Status</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {purchase?.status?.toUpperCase() || "PAID"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button: Go to Course */}
                <Button
                  size="lg"
                  onClick={() => navigate(`/course-progress/${targetCourseId}`)}
                  className="w-full cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-6 text-base"
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  Continue Learning / Go to Course
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>

                {/* Secondary Actions: Receipt & PDF */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <Button
                    variant="outline"
                    onClick={() => setReceiptModalOpen(true)}
                    className="cursor-pointer border-gray-300 dark:border-gray-700"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Receipt
                  </Button>

                  <Button
                    variant="outline"
                    onClick={onDownloadClick}
                    disabled={downloadingPdf || !purchase?._id}
                    className="cursor-pointer border-gray-300 dark:border-gray-700"
                  >
                    {downloadingPdf ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF Receipt
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-center pt-2">
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => navigate("/student/dashboard")}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Return to Student Dashboard
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Receipt Dialog Modal */}
      {purchase?._id && (
        <ReceiptModal
          purchaseId={purchase._id}
          sessionId={sessionId}
          isOpen={receiptModalOpen}
          onOpenChange={setReceiptModalOpen}
        />
      )}
    </div>
  );
};

export default PaymentSuccess;
