import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  useGetCourseQuizQuery,
  useStartQuizMutation,
  useSubmitQuizMutation,
  useGetAttemptResultQuery,
  useGetMyAttemptsQuery,
} from "@/features/api/quizApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import CertificateModal, { handleDownloadCertificatePdf } from "@/components/CertificateModal";
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  RotateCcw,
  FileCheck,
  Lock,
  Sparkles,
  HelpCircle,
  Eye,
  Download,
  Loader2,
  Check,
  X,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

const QuizPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // API Queries
  const {
    data: quizData,
    isLoading: quizLoading,
    isError: quizError,
    refetch: refetchQuiz,
  } = useGetCourseQuizQuery(courseId);

  const [startQuizMutation, { isLoading: startLoading }] = useStartQuizMutation();
  const [submitQuizMutation, { isLoading: submitLoading }] = useSubmitQuizMutation();

  // Component States: "start" | "active" | "result" | "review"
  const [mode, setMode] = useState("start");

  // Active Test State
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: selectedOptionId }
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);

  // Result & Review State
  const [resultSummary, setResultSummary] = useState(null);
  const [certificateData, setCertificateData] = useState(null);
  const [reviewData, setReviewData] = useState([]);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(false);

  // Timer Ref
  const timerRef = useRef(null);

  const quiz = quizData?.quiz;
  const eligibility = quizData?.eligibility;
  const pastAttempts = quizData?.pastAttempts || [];

  // -------------------------------------------------------------
  // Countdown Timer Logic
  // -------------------------------------------------------------
  useEffect(() => {
    if (mode === "active" && remainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [mode, remainingSeconds]);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // -------------------------------------------------------------
  // Start / Resume Quiz Handler
  // -------------------------------------------------------------
  const handleStartQuiz = async () => {
    try {
      const res = await startQuizMutation(quiz._id).unwrap();
      if (res.success) {
        setAttempt(res.attempt);
        setQuestions(res.questions || []);
        setCurrentIdx(0);
        setAnswers({});
        setMarkedForReview(new Set());
        setRemainingSeconds(res.attempt.remainingSeconds || res.attempt.allowedDurationSeconds || 1200);
        setMode("active");
        toast.success(res.isResumed ? "Resumed active assessment!" : "Assessment started! Good luck.");
      }
    } catch (err) {
      console.error("Start quiz error:", err);
      toast.error(err?.data?.message || "Failed to start assessment.");
    }
  };

  // -------------------------------------------------------------
  // Answer Selection
  // -------------------------------------------------------------
  const handleSelectOption = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const toggleMarkForReview = (questionId) => {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  // -------------------------------------------------------------
  // Submit Assessment (Manual & Auto)
  // -------------------------------------------------------------
  const handleAutoSubmit = () => {
    toast.warning("Time expired! Your assessment is being submitted automatically.");
    executeSubmission(true);
  };

  const executeSubmission = async (isAuto = false) => {
    clearInterval(timerRef.current);
    setSubmitModalOpen(false);

    try {
      const answersPayload = questions.map((q) => ({
        questionId: q._id,
        selectedOptionId: answers[q._id] || null,
      }));

      const res = await submitQuizMutation({
        quizId: quiz._id,
        attemptId: attempt._id,
        answers: answersPayload,
      }).unwrap();

      if (res.success) {
        setResultSummary(res.summary);
        if (res.certificate) {
          setCertificateData(res.certificate);
        }
        setMode("result");
        refetchQuiz();

        if (res.summary.result === "passed") {
          toast.success("🎉 Congratulations! You passed the assessment!");
        } else {
          toast.error("Assessment not passed. You can retake if attempts remain.");
        }
      }
    } catch (err) {
      console.error("Submit error:", err);
      toast.error(err?.data?.message || "Submission error.");
    }
  };

  // -------------------------------------------------------------
  // Review Answers Handler
  // -------------------------------------------------------------
  const handleReviewAnswers = async (targetAttemptId) => {
    const idToFetch = targetAttemptId || resultSummary?.attemptId || attempt?._id;
    if (!idToFetch) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/quiz/attempt/${idToFetch}`,
        { credentials: "include" }
      );
      const data = await response.json();
      if (data.success) {
        setReviewData(data.review || []);
        if (!resultSummary) {
          setResultSummary(data.summary);
        }
        setMode("review");
      } else {
        toast.error(data.message || "Failed to load review.");
      }
    } catch (err) {
      console.error("Review fetch error:", err);
      toast.error("Failed to fetch answer review.");
    }
  };

  // -------------------------------------------------------------
  // Render Loading & Error States
  // -------------------------------------------------------------
  if (quizLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading course assessment...</p>
        </div>
      </div>
    );
  }

  if (quizError || !quiz) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold">Assessment Unavailable</h2>
        <p className="text-sm text-muted-foreground">
          There is currently no published assessment for this course.
        </p>
        <Button onClick={() => navigate(`/course-progress/${courseId}`)}>
          Back to Course
        </Button>
      </div>
    );
  }

  // =============================================================
  // MODE 1: START / ELIGIBILITY SCREEN
  // =============================================================
  if (mode === "start") {
    const isLocked = !eligibility?.isUnlocked;
    const isPassed = eligibility?.isPassed;
    const remaining = eligibility?.attemptsRemaining ?? quiz.maxAttempts;

    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-[#0A0A0A] py-10 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Back link */}
          <Link
            to={`/course-progress/${courseId}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Course Lessons</span>
          </Link>

          {/* Assessment Header Card */}
          <Card className="border-border/80 shadow-sm overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500" />
            <CardHeader className="p-6 sm:p-8 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                  <Award className="w-3.5 h-3.5" />
                  Official Certification Exam
                </span>
                {isPassed ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs gap-1.5 py-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Passed & Certified
                  </Badge>
                ) : isLocked ? (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs gap-1.5 py-1">
                    <Lock className="w-3.5 h-3.5" />
                    Locked ({eligibility?.progressPercentage || 0}% completed)
                  </Badge>
                ) : (
                  <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-xs gap-1.5 py-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Ready to Take
                  </Badge>
                )}
              </div>

              <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
                {quiz.title}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                {quiz.description || "Demonstrate your mastery to earn your verified SkillStack certificate."}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 pt-0 space-y-6">
              {/* Requirements & Parameters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/40 border border-border/60 text-center">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-medium">Questions</span>
                  <p className="text-lg font-bold text-foreground">{quiz.totalQuestions}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-medium">Duration</span>
                  <p className="text-lg font-bold text-foreground">{quiz.duration} Mins</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-medium">Passing Score</span>
                  <p className="text-lg font-bold text-foreground">{quiz.passingPercentage}%</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-medium">Attempts Left</span>
                  <p className="text-lg font-bold text-foreground">{remaining} / {quiz.maxAttempts}</p>
                </div>
              </div>

              {/* Course Progress Warning if locked */}
              {isLocked && (
                <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                      Assessment Locked
                    </h4>
                    <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                      You must complete 100% of all lessons in this course before the final assessment is unlocked.
                      Currently at <span className="font-bold">{eligibility?.progressPercentage}%</span> ({eligibility?.viewedLectures} of {eligibility?.totalLectures} lessons viewed).
                    </p>
                  </div>
                </div>
              )}

              {/* If already passed */}
              {isPassed && (
                <div className="p-5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                        Course Certified!
                      </h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400">
                        Best Score: <span className="font-bold">{eligibility.bestScore}%</span>. Your certificate has been issued.
                      </p>
                    </div>
                  </div>

                  {eligibility.certificateId && (
                    <Button
                      size="sm"
                      onClick={() => navigate(`/verify-certificate/${eligibility.certificateId}`)}
                      className="cursor-pointer gap-1.5 text-xs font-semibold"
                    >
                      <Award className="w-4 h-4" />
                      View Certificate
                    </Button>
                  )}
                </div>
              )}

              {/* Assessment Rules */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Exam Guidelines & Policies
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                  <li>The test runs continuously on a synchronized server-side countdown timer.</li>
                  <li>When the timer expires, all answered questions will be submitted automatically.</li>
                  <li>A minimum score of {quiz.passingPercentage}% is mandatory to generate your completion certificate.</li>
                  <li>You can review every question, change your choices, and flag items for review before submission.</li>
                  <li>A detailed answer key with full explanations will unlock immediately after submission.</li>
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                {isLocked ? (
                  <Button
                    onClick={() => navigate(`/course-progress/${courseId}`)}
                    className="w-full h-11 font-semibold cursor-pointer gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Continue Course Lessons
                  </Button>
                ) : remaining === 0 && !isPassed ? (
                  <div className="text-center py-2">
                    <p className="text-xs text-red-600 font-semibold mb-2">
                      You have exhausted all {quiz.maxAttempts} allowed attempts for this assessment.
                    </p>
                    <Button variant="outline" onClick={() => navigate(`/course-progress/${courseId}`)}>
                      Return to Course
                    </Button>
                  </div>
                ) : (
                  <Button
                    disabled={startLoading}
                    onClick={handleStartQuiz}
                    className="w-full h-12 text-sm sm:text-base font-semibold bg-primary hover:bg-primary/90 cursor-pointer shadow-md hover:shadow-lg transition-all gap-2"
                  >
                    {startLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Preparing Assessment...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        {isPassed ? "Retake for Higher Score" : "Start Final Assessment"}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Past Attempts Table */}
          {pastAttempts.length > 0 && (
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Your Past Attempts</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="divide-y divide-border/60">
                  {pastAttempts.map((att) => (
                    <div
                      key={att._id}
                      className="py-3 flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-semibold text-foreground">
                          Attempt #{att.attemptNumber}
                        </span>
                        <p className="text-muted-foreground">
                          {att.submittedAt
                            ? new Date(att.submittedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "In Progress"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm">
                          {att.percentage !== undefined ? `${att.percentage}%` : "--"}
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            att.result === "passed"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-300 dark:bg-emerald-950/30"
                              : "bg-red-50 text-red-600 border-red-300 dark:bg-red-950/30"
                          }
                        >
                          {att.result === "passed" ? "Passed" : "Failed"}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReviewAnswers(att._id)}
                          className="h-8 text-xs cursor-pointer gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // =============================================================
  // MODE 2: ACTIVE TIMED ASSESSMENT
  // =============================================================
  if (mode === "active") {
    const currentQ = questions[currentIdx];
    const answeredCount = Object.keys(answers).length;
    const unansweredCount = questions.length - answeredCount;
    const isUrgentTimer = remainingSeconds < 60;
    const isWarningTimer = remainingSeconds < 300 && !isUrgentTimer;

    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-[#0A0A0A] py-6 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Top Sticky Test Bar */}
          <div className="sticky top-16 z-20 bg-background/95 backdrop-blur border border-border/80 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-sm sm:text-base text-foreground truncate max-w-xs sm:max-w-md">
                {quiz.title}
              </h2>
              <p className="text-xs text-muted-foreground">
                Question {currentIdx + 1} of {questions.length} • {answeredCount} Answered
              </p>
            </div>

            {/* Timer Badge */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold border transition-colors ${
                isUrgentTimer
                  ? "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 animate-pulse"
                  : isWarningTimer
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  : "bg-muted text-foreground border-border"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTimer(remainingSeconds)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Question Card (3 Cols) */}
            <div className="lg:col-span-3 space-y-4">
              <Card className="border-border/80 shadow-sm min-h-[380px] flex flex-col justify-between">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Question {currentIdx + 1}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleMarkForReview(currentQ._id)}
                      className={`h-8 text-xs gap-1.5 cursor-pointer ${
                        markedForReview.has(currentQ._id)
                          ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30"
                          : "text-muted-foreground"
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      {markedForReview.has(currentQ._id) ? "Marked for Review" : "Mark for Review"}
                    </Button>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug">
                    {currentQ.questionText}
                  </h3>
                </CardHeader>

                <CardContent className="space-y-3 pb-6 flex-1">
                  <div className="space-y-2.5">
                    {currentQ.options.map((opt) => {
                      const isSelected = answers[currentQ._id] === opt.optionId;
                      return (
                        <div
                          key={opt.optionId}
                          onClick={() => handleSelectOption(currentQ._id, opt.optionId)}
                          className={`p-3.5 rounded-xl border transition-all duration-150 cursor-pointer flex items-center gap-3 ${
                            isSelected
                              ? "bg-primary/5 border-primary shadow-xs"
                              : "bg-card hover:bg-muted/40 border-border/70"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-muted-foreground/40 text-muted-foreground"
                            }`}
                          >
                            {opt.optionId}
                          </div>
                          <span className="text-xs sm:text-sm text-foreground font-medium">
                            {opt.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>

                {/* Bottom Navigation Buttons */}
                <div className="p-4 border-t border-border/60 flex items-center justify-between gap-3 bg-muted/20">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx((i) => i - 1)}
                    className="cursor-pointer gap-1.5 text-xs font-semibold"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    {currentIdx < questions.length - 1 ? (
                      <Button
                        size="sm"
                        onClick={() => setCurrentIdx((i) => i + 1)}
                        className="cursor-pointer gap-1.5 text-xs font-semibold"
                      >
                        Next
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setSubmitModalOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer gap-1.5 text-xs font-semibold shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Finish & Submit
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Question Palette (1 Col) */}
            <div className="space-y-4">
              <Card className="border-border/80 shadow-sm p-4 space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Question Navigator
                </h4>

                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, idx) => {
                    const isCurrent = currentIdx === idx;
                    const isAnswered = !!answers[q._id];
                    const isMarked = markedForReview.has(q._id);

                    let bgClass = "bg-muted text-muted-foreground border-border/60";
                    if (isAnswered) bgClass = "bg-emerald-600 text-white border-emerald-600";
                    if (isMarked) bgClass = "bg-purple-600 text-white border-purple-600";

                    return (
                      <button
                        key={q._id}
                        type="button"
                        onClick={() => setCurrentIdx(idx)}
                        className={`h-8 rounded-lg text-xs font-bold border transition-all cursor-pointer ${bgClass} ${
                          isCurrent ? "ring-2 ring-primary ring-offset-2" : ""
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="pt-2 border-t border-border/60 space-y-1.5 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-emerald-600 inline-block" />
                    <span>Answered ({answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-muted border border-border/60 inline-block" />
                    <span>Unanswered ({unansweredCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-purple-600 inline-block" />
                    <span>Marked for Review ({markedForReview.size})</span>
                  </div>
                </div>

                {/* Submit button from palette */}
                <Button
                  size="sm"
                  onClick={() => setSubmitModalOpen(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer font-semibold text-xs mt-2"
                >
                  Submit Assessment
                </Button>
              </Card>
            </div>
          </div>
        </div>

        {/* Submit Confirmation Dialog */}
        <Dialog open={submitModalOpen} onOpenChange={setSubmitModalOpen}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-xl font-bold">
                Submit Final Assessment?
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Once submitted, your answers will be evaluated server-side and your final score will be calculated.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-3">
              <div className="p-4 rounded-xl bg-muted/40 border border-border/60 grid grid-cols-3 text-center">
                <div>
                  <span className="text-xs text-muted-foreground">Answered</span>
                  <p className="text-base font-bold text-emerald-600">{answeredCount}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Unanswered</span>
                  <p className="text-base font-bold text-amber-600">{unansweredCount}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Total</span>
                  <p className="text-base font-bold text-foreground">{questions.length}</p>
                </div>
              </div>

              {unansweredCount > 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  Warning: You have {unansweredCount} unanswered questions. Unanswered questions will be scored 0 marks.
                </p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setSubmitModalOpen(false)}
                className="cursor-pointer text-xs"
              >
                Back to Test
              </Button>
              <Button
                disabled={submitLoading}
                onClick={() => executeSubmission(false)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer text-xs font-semibold gap-1.5"
              >
                {submitLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Grading Answers...
                  </>
                ) : (
                  "Confirm & Submit"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // =============================================================
  // MODE 3: RESULT SCREEN
  // =============================================================
  if (mode === "result" && resultSummary) {
    const isPassed = resultSummary.result === "passed";

    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-[#0A0A0A] py-10 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto space-y-8">
          <Card className={`border overflow-hidden shadow-lg ${
            isPassed
              ? "border-emerald-300 dark:border-emerald-800"
              : "border-red-300 dark:border-red-800"
          }`}>
            {/* Top Header Banner */}
            <div className={`p-6 text-white text-center space-y-2 ${
              isPassed ? "bg-emerald-600" : "bg-red-600"
            }`}>
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-1">
                {isPassed ? <Award className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                {isPassed ? "ASSESSMENT PASSED!" : "ASSESSMENT NOT PASSED"}
              </h2>
              <p className="text-xs sm:text-sm text-white/90">
                {isPassed
                  ? "Congratulations! You have fulfilled all requirements and completed this course."
                  : `You scored ${resultSummary.percentage}%. A minimum of ${resultSummary.passingPercentage}% is required to pass.`}
              </p>
            </div>

            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Score Highlight Box */}
              <div className="p-6 rounded-2xl bg-muted/40 border border-border/70 text-center space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Final Evaluated Score
                </span>
                <div className="text-4xl sm:text-5xl font-black text-foreground">
                  {resultSummary.percentage}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {resultSummary.correctAnswers} of {resultSummary.totalQuestions} Questions Answered Correctly
                </p>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">Correct</span>
                  <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {resultSummary.correctAnswers}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
                  <span className="text-red-700 dark:text-red-400 font-medium">Incorrect</span>
                  <p className="text-lg font-bold text-red-700 dark:text-red-400 mt-0.5">
                    {resultSummary.incorrectAnswers}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                  <span className="text-amber-700 dark:text-amber-400 font-medium">Unanswered</span>
                  <p className="text-lg font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                    {resultSummary.unansweredQuestions}
                  </p>
                </div>
              </div>

              {/* Certificate Unlock Banner if Passed */}
              {isPassed && certificateData && (
                <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-200 dark:bg-amber-900/40 text-amber-700 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        Official Certificate Generated!
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        ID: <span className="font-mono font-bold text-foreground">{certificateData.certificateId}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      size="sm"
                      onClick={() => setCertModalOpen(true)}
                      className="w-full sm:w-auto text-xs cursor-pointer gap-1.5 font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Certificate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={downloadingCert}
                      onClick={() => handleDownloadCertificatePdf(certificateData.certificateId, setDownloadingCert)}
                      className="w-full sm:w-auto text-xs cursor-pointer gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => handleReviewAnswers()}
                  className="w-full sm:w-1/2 cursor-pointer text-xs font-semibold gap-1.5 h-11"
                >
                  <Eye className="w-4 h-4" />
                  Review Answers & Explanations
                </Button>

                {!isPassed && (eligibility?.attemptsRemaining ?? 1) > 0 ? (
                  <Button
                    onClick={handleStartQuiz}
                    className="w-full sm:w-1/2 cursor-pointer text-xs font-semibold gap-1.5 h-11 bg-primary text-primary-foreground"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Retake Assessment ({eligibility.attemptsRemaining} left)
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigate(`/course-progress/${courseId}`)}
                    className="w-full sm:w-1/2 cursor-pointer text-xs font-semibold gap-1.5 h-11 bg-primary text-primary-foreground"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Return to Course
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certificate Modal */}
        <CertificateModal
          isOpen={certModalOpen}
          onClose={() => setCertModalOpen(false)}
          certificate={certificateData}
        />
      </div>
    );
  }

  // =============================================================
  // MODE 4: DETAILED ANSWER REVIEW
  // =============================================================
  if (mode === "review") {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-[#0A0A0A] py-10 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMode(resultSummary ? "result" : "start")}
              className="cursor-pointer gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="text-right">
              <h2 className="text-base font-bold">Answer Review Key</h2>
              <p className="text-xs text-muted-foreground">
                Detailed explanations for every question
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {reviewData.map((item, idx) => (
              <Card
                key={item.questionId || idx}
                className={`border shadow-xs transition-colors ${
                  item.isCorrect
                    ? "border-emerald-200 dark:border-emerald-900/60"
                    : "border-red-200 dark:border-red-900/60"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Question {idx + 1}
                    </span>
                    <Badge
                      className={`text-xs gap-1 py-0.5 ${
                        item.isCorrect
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-300"
                          : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-300"
                      }`}
                    >
                      {item.isCorrect ? (
                        <>
                          <Check className="w-3 h-3" /> Correct
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3" /> Incorrect
                        </>
                      )}
                    </Badge>
                  </div>

                  <CardTitle className="text-base font-bold leading-snug">
                    {item.questionText}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3 pt-0 text-xs">
                  {/* Options List */}
                  <div className="space-y-1.5">
                    {item.options.map((opt) => {
                      const isStudentPick = item.selectedOptionId === opt.optionId;
                      const isCorrectAnswer = item.correctOptionId === opt.optionId;

                      let optStyle = "bg-muted/30 border-border/50 text-foreground";
                      if (isCorrectAnswer) {
                        optStyle = "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-semibold";
                      } else if (isStudentPick && !isCorrectAnswer) {
                        optStyle = "bg-red-50 dark:bg-red-950/30 border-red-400 text-red-900 dark:text-red-200";
                      }

                      return (
                        <div
                          key={opt.optionId}
                          className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${optStyle}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold w-5">{opt.optionId}.</span>
                            <span>{opt.text}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isStudentPick && (
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                                Your Choice
                              </Badge>
                            )}
                            {isCorrectAnswer && (
                              <Badge className="bg-emerald-600 text-white text-[10px] py-0 px-1.5 border-transparent">
                                Correct Answer
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Accordion */}
                  {item.explanation && (
                    <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-blue-900 dark:text-blue-300">
                      <span className="font-bold block mb-1">Explanation:</span>
                      <p className="leading-relaxed text-xs">{item.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center pt-4">
            <Button
              onClick={() => setMode(resultSummary ? "result" : "start")}
              className="px-8 cursor-pointer font-semibold text-xs"
            >
              Back to Result Summary
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default QuizPage;
