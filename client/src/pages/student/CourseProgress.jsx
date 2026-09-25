import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { CheckCircle, CheckCircle2, CirclePlay, Award, Lock, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CertificateModal from "@/components/CertificateModal";
import {
  useCompleteCourseMutation,
  useGetCourseProgressQuery,
  useInCompleteCourseMutation,
  useUpdateLectureProgressMutation,
} from "@/features/api/courseProgressApi";
import { toast } from "sonner";

const CourseProgress = () => {
  const params = useParams();
  const navigate = useNavigate();
  const courseId = params.courseId;

  // 1. All hooks MUST be declared unconditionally at the top level
  const { data, isLoading, isError, refetch } =
    useGetCourseProgressQuery(courseId);

  const [updateLectureProgress] = useUpdateLectureProgressMutation();

  const [
    completeCourse,
    { data: markCompleteData, isSuccess: completedSuccess },
  ] = useCompleteCourseMutation();
  const [
    inCompleteCourse,
    { data: markInCompleteData, isSuccess: inCompletedSuccess },
  ] = useInCompleteCourseMutation();

  const [currentLecture, setCurrentLecture] = useState(null);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [certData, setCertData] = useState(null);

  useEffect(() => {
    if (completedSuccess && markCompleteData?.message) {
      refetch();
      toast.success(markCompleteData.message);
    }
    if (inCompletedSuccess && markInCompleteData?.message) {
      refetch();
      toast.success(markInCompleteData.message);
    }
  }, [completedSuccess, inCompletedSuccess, markCompleteData, markInCompleteData, refetch]);

  // 2. Conditional render guards after all hooks are declared
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 animate-pulse">
        <div className="bg-card border border-border/70 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="h-8 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="md:col-span-5 h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-md text-center shadow-xs space-y-4">
          <p className="text-base font-bold text-slate-900 dark:text-white">
            Failed to load course details
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Please make sure you are enrolled in this course and try again.
          </p>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="cursor-pointer text-xs"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const {
    courseDetails = {},
    progress = [],
    completed = false,
    progressPercentage = 0,
    courseCompleted = false,
    finalAssessmentPassed = false,
    finalAssessmentScore = null,
    certificateId = null,
  } = data.data;
  const { courseTitle = "Course Classroom" } = courseDetails;

  const handleOpenCertificate = async () => {
    if (certificateId) {
      try {
        const res = await fetch(`http://localhost:8080/api/v1/certificate/${certificateId}`, {
          credentials: "include",
        });
        const d = await res.json();
        if (d.success) {
          setCertData(d.certificate);
          setCertModalOpen(true);
        } else {
          toast.error("Certificate record not found.");
        }
      } catch (e) {
        toast.error("Failed to load certificate.");
      }
    }
  };

  //initialize the first lecture if not exist
  const initialLecture =
    currentLecture || (courseDetails.lectures && courseDetails.lectures[0]);

  const isLectureCompleted = (lectureId) => {
    return progress.some((prog) => prog.lectureId === lectureId && prog.viewed);
  };

  const handleLectureProgress = async (lectureId) => {
    await updateLectureProgress({ courseId, lectureId });
    refetch();
  };

  //handle select a specific lecture to watch
  const handleSelectLecture = (lecture) => {
    setCurrentLecture(lecture);
    handleLectureProgress(lecture._id);
  };

  const handleCompleteCourse = async () => {
    await completeCourse(courseId);
    refetch();
  };

  const handleInCompleteCourse = async () => {
    await inCompleteCourse(courseId);
    refetch();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Course Title, Progress Bar, & Actions */}
      <div className="bg-card border border-border/70 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Course Progress & Classroom
              </span>
              {courseCompleted && (
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
                  🏆 Certified
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {courseTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={completed ? handleInCompleteCourse : handleCompleteCourse}
              variant={completed ? "outline" : "default"}
              size="sm"
              className="cursor-pointer text-xs font-semibold"
            >
              {completed ? (
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1.5 text-emerald-600" />
                  <span>All Lessons Viewed</span>
                </div>
              ) : (
                "Mark All as Viewed"
              )}
            </Button>
          </div>
        </div>

        {/* Real Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground font-medium">
            <span>Lesson Completion</span>
            <span className="font-bold text-foreground">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                progressPercentage === 100
                  ? "bg-emerald-600"
                  : "bg-primary"
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* FINAL ASSESSMENT CALLOUT BANNER */}
      <Card className={`border shadow-sm overflow-hidden ${
        courseCompleted
          ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10"
          : progressPercentage === 100
          ? "border-blue-300 dark:border-blue-800 bg-blue-50/20 dark:bg-blue-950/10"
          : "border-border/80 bg-card"
      }`}>
        <div className={`h-1.5 ${
          courseCompleted
            ? "bg-emerald-600"
            : progressPercentage === 100
            ? "bg-blue-600"
            : "bg-muted"
        }`} />
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                courseCompleted
                  ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600"
                  : progressPercentage === 100
                  ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600"
                  : "bg-muted text-muted-foreground"
              }`}>
                {courseCompleted ? (
                  <Award className="w-6 h-6" />
                ) : progressPercentage === 100 ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Lock className="w-5 h-5" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base sm:text-lg text-foreground">
                    FINAL ASSESSMENT & CERTIFICATION
                  </h3>
                  <Badge variant="outline" className={`text-xs ${
                    courseCompleted
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : progressPercentage === 100
                      ? "bg-blue-50 text-blue-700 border-blue-300"
                      : "bg-muted text-muted-foreground border-border"
                  }`}>
                    {courseCompleted
                      ? `Passed (${finalAssessmentScore}%)`
                      : progressPercentage === 100
                      ? "✓ Unlocked"
                      : "🔒 Locked"}
                  </Badge>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
                  {courseCompleted
                    ? "Congratulations! You completed all lessons and passed the final assessment. Your verified certificate is ready."
                    : progressPercentage === 100
                    ? "You have completed all course lessons! Your final assessment is now unlocked. Score 60% or higher to earn your verified certificate."
                    : "Complete all course lessons (100% progress) to unlock your final certification test."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
              {courseCompleted ? (
                <>
                  <Button
                    size="sm"
                    onClick={handleOpenCertificate}
                    className="cursor-pointer gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Award className="w-4 h-4" />
                    View Certificate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/course/${courseId}/quiz`)}
                    className="cursor-pointer text-xs"
                  >
                    Quiz Details
                  </Button>
                </>
              ) : progressPercentage === 100 ? (
                <Button
                  size="sm"
                  onClick={() => navigate(`/course/${courseId}/quiz`)}
                  className="w-full sm:w-auto cursor-pointer gap-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  Take Final Test
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  disabled
                  className="w-full sm:w-auto text-xs opacity-70 cursor-not-allowed gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Locked (Finish Lessons)
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Video & Lectures Section */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Video Player Section */}
        <div className="flex-1 md:w-3/5 h-fit rounded-2xl border border-border/70 shadow-xs p-4 bg-card">
          <div>
            <video
              src={currentLecture?.videoUrl || initialLecture?.videoUrl}
              controls
              className="w-full h-auto md:rounded-xl aspect-video bg-black"
              onPlay={() =>
                handleLectureProgress(currentLecture?._id || initialLecture?._id)
              }
            />
          </div>
          <div className="mt-3">
            <h3 className="font-bold text-base sm:text-lg text-foreground">
              {`Lecture ${courseDetails.lectures.findIndex((lec) => lec._id === (currentLecture?._id || initialLecture?._id)) + 1} : ${currentLecture?.lectureTitle || initialLecture?.lectureTitle}`}
            </h3>
          </div>
        </div>

        {/* Lecture Playlist Sidebar */}
        <div className="flex flex-col w-full md:w-2/5 border-t md:border-t-0 md:border-l border-border/70 md:pl-6 pt-4 md:pt-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg text-foreground">Course Lectures</h2>
            <span className="text-xs text-muted-foreground font-medium">
              {progress.filter((p) => p.viewed).length} of {courseDetails.lectures.length} completed
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[550px] pr-1">
            {courseDetails?.lectures.map((lecture, idx) => {
              const completed = isLectureCompleted(lecture._id);
              const isCurrent = lecture._id === (currentLecture?._id || initialLecture?._id);

              return (
                <div
                  key={lecture._id}
                  onClick={() => handleSelectLecture(lecture)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isCurrent
                      ? "bg-primary/10 border-primary/50 shadow-2xs"
                      : "bg-card hover:bg-muted/40 border-border/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {completed ? (
                      <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                    ) : (
                      <CirclePlay size={20} className="text-muted-foreground shrink-0" />
                    )}
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-1">
                        {idx + 1}. {lecture.lectureTitle}
                      </p>
                    </div>
                  </div>

                  {completed && (
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-300 dark:bg-emerald-950/30">
                      Viewed
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        certificate={certData}
      />
    </div>
  );
};

export default CourseProgress;
