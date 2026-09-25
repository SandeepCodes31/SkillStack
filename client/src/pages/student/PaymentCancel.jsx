import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle, ArrowLeft, Compass, RotateCcw } from "lucide-react";

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseId = searchParams.get("course_id");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <Card className="shadow-lg border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141212] overflow-hidden text-center">
          <div className="bg-red-500/10 dark:bg-red-950/20 p-8 border-b border-red-100 dark:border-red-900/30">
            <div className="inline-flex p-3 rounded-full bg-red-100 dark:bg-red-900/40 mb-3">
              <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Cancelled</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Your payment was cancelled. No charges were made, and no course access was granted.
            </p>
          </div>

          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You can try checking out again whenever you are ready, or explore other courses in our catalog.
            </p>

            <div className="space-y-2 pt-2">
              {courseId && (
                <Button
                  onClick={() => navigate(`/course-detail/${courseId}`)}
                  className="w-full cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Try Again / Back to Course
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => navigate("/course/search?query")}
                className="w-full cursor-pointer border-gray-300 dark:border-gray-700"
              >
                <Compass className="h-4 w-4 mr-2" />
                Browse Catalog
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/student/dashboard")}
                className="text-xs text-muted-foreground"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentCancel;
