import React, { useState } from "react";
import {
  useGetAllAdminQuizzesQuery,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
} from "@/features/api/quizApi";
import { useGetCreatorCourseQuery } from "@/features/api/courseApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import QuestionModal from "./QuestionModal";
import {
  Award,
  Plus,
  Edit,
  Trash2,
  HelpCircle,
  CheckCircle2,
  Clock,
  BookOpen,
  Loader2,
  Search,
  Sparkles,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

const AdminQuizzes = () => {
  const { data: quizzesData, isLoading, refetch } = useGetAllAdminQuizzesQuery();
  const { data: coursesData } = useGetCreatorCourseQuery();

  const [createQuizMutation, { isLoading: createLoading }] = useCreateQuizMutation();
  const [updateQuizMutation, { isLoading: updateLoading }] = useUpdateQuizMutation();
  const [deleteQuizMutation] = useDeleteQuizMutation();

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form State
  const [formCourseId, setFormCourseId] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDuration, setFormDuration] = useState("20");
  const [formPassing, setFormPassing] = useState("60");
  const [formMaxAttempts, setFormMaxAttempts] = useState("3");

  const quizzes = quizzesData?.quizzes || [];
  const courses = coursesData?.courses || [];

  const filteredQuizzes = quizzes.filter((q) => {
    const term = searchTerm.toLowerCase();
    return (
      (q.title || "").toLowerCase().includes(term) ||
      (q.courseTitle || "").toLowerCase().includes(term)
    );
  });

  const totalQuestions = quizzes.reduce((acc, q) => acc + (q.questionsCount || 0), 0);

  const handleOpenCreate = () => {
    setSelectedQuiz(null);
    setFormCourseId("");
    setFormTitle("");
    setFormDescription("");
    setFormDuration("20");
    setFormPassing("60");
    setFormMaxAttempts("3");
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (q) => {
    setSelectedQuiz(q);
    setFormCourseId(q.courseId || "");
    setFormTitle(q.title || "");
    setFormDescription(q.description || "");
    setFormDuration(String(q.duration || 20));
    setFormPassing(String(q.passingPercentage || 60));
    setFormMaxAttempts(String(q.maxAttempts || 3));
    setCreateModalOpen(true);
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error("Assessment title is required.");
      return;
    }

    try {
      if (selectedQuiz) {
        await updateQuizMutation({
          quizId: selectedQuiz._id,
          title: formTitle,
          description: formDescription,
          duration: Number(formDuration),
          passingPercentage: Number(formPassing),
          maxAttempts: Number(formMaxAttempts),
        }).unwrap();
        toast.success("Assessment settings updated!");
      } else {
        if (!formCourseId) {
          toast.error("Please select an associated course.");
          return;
        }
        await createQuizMutation({
          courseId: formCourseId,
          title: formTitle,
          description: formDescription,
          duration: Number(formDuration),
          passingPercentage: Number(formPassing),
          maxAttempts: Number(formMaxAttempts),
        }).unwrap();
        toast.success("Assessment created successfully!");
      }
      setCreateModalOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to save assessment.");
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this assessment and all student attempts?")) return;
    try {
      await deleteQuizMutation(quizId).unwrap();
      toast.success("Assessment deleted.");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete.");
    }
  };

  const handleManageQuestions = (q) => {
    setSelectedQuiz(q);
    setQuestionModalOpen(true);
  };

  if (isLoading) {
    return <QuizzesSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* ==================================================== */}
      {/* 1. TOP HEADER & CREATE BUTTON */}
      {/* ==================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-sky-300 border border-blue-200/60 dark:border-blue-800 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
            <span>Qualification & Evaluation</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
              Course Assessments & Quizzes
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-sky-400 border border-blue-200/60 dark:border-blue-800">
              {quizzes.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Configure final qualification tests and question banks required for course certificate issuance.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold h-10 px-4 rounded-xl shadow-xs cursor-pointer flex items-center gap-2 self-start sm:self-auto transition-all active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Create Assessment</span>
        </Button>
      </div>

      {/* ==================================================== */}
      {/* 2. STATS PILLS & SEARCH */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{quizzes.length}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Assessments</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{totalQuestions}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Active Questions in Bank</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {quizzes.length > 0 ? Math.round(quizzes.reduce((s, q) => s + (q.passingPercentage || 60), 0) / quizzes.length) : 60}%
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Avg. Passing Threshold</p>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter assessments by title or course..."
          className="pl-9 h-9 text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs"
        />
      </div>

      {/* ==================================================== */}
      {/* 3. TABLE CARD */}
      {/* ==================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {filteredQuizzes.length === 0 ? (
          <div className="py-16 text-center max-w-md mx-auto space-y-3 px-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {searchTerm ? "No matching assessments found" : "No assessments created yet"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {searchTerm
                ? "Try searching for a different course or title."
                : "Create a final exam to enable automatic scoring and verifiable certificate unlock."}
            </p>
            {!searchTerm && (
              <Button
                size="sm"
                onClick={handleOpenCreate}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl h-9 px-4 gap-1.5 cursor-pointer mt-1"
              >
                <Plus className="w-4 h-4" />
                <span>Create Assessment</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/75 dark:bg-slate-800/50">
                <TableRow className="border-b border-[#E2E8F0] dark:border-slate-800">
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Course
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Assessment Title
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                    Questions
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                    Duration
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                    Passing %
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                    Max Attempts
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuizzes.map((q) => (
                  <TableRow
                    key={q._id}
                    className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <TableCell className="py-3.5 font-bold text-xs sm:text-sm text-slate-900 dark:text-white max-w-[200px] truncate">
                      {q.courseTitle}
                    </TableCell>
                    <TableCell className="py-3.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      {q.title}
                    </TableCell>
                    <TableCell className="py-3.5 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-sky-300 border border-blue-200/60 dark:border-blue-800">
                        {q.questionsCount}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 text-center text-xs text-slate-600 dark:text-slate-400 font-medium">
                      {q.duration} min
                    </TableCell>
                    <TableCell className="py-3.5 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {q.passingPercentage}%
                    </TableCell>
                    <TableCell className="py-3.5 text-center text-xs text-slate-600 dark:text-slate-400 font-medium">
                      {q.maxAttempts}
                    </TableCell>
                    <TableCell className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleManageQuestions(q)}
                          className="h-8 text-xs font-semibold rounded-lg border-blue-200 dark:border-blue-900 text-blue-600 dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 cursor-pointer gap-1.5"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Questions</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEdit(q)}
                          className="h-8 w-8 p-0 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 cursor-pointer rounded-lg"
                          title="Edit Settings"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteQuiz(q._id)}
                          className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer rounded-lg"
                          title="Delete Assessment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* ==================================================== */}
      {/* 4. CREATE / EDIT QUIZ MODAL */}
      {/* ==================================================== */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              {selectedQuiz ? "Edit Assessment Settings" : "Create Final Assessment"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Define qualification test duration, passing criteria, and maximum attempts.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveQuiz} className="space-y-4 pt-2">
            {!selectedQuiz && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Associated Course *
                </Label>
                <Select value={formCourseId} onValueChange={setFormCourseId}>
                  <SelectTrigger className="text-xs rounded-xl h-10">
                    <SelectValue placeholder="Choose a course..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {courses.map((c) => (
                      <SelectItem key={c._id} value={c._id} className="text-xs">
                        {c.courseTitle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Assessment Title *
              </Label>
              <Input
                placeholder="e.g. Full-Stack MERN Final Assessment"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="text-xs rounded-xl h-10"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Description & Instructions
              </Label>
              <Textarea
                rows={2}
                placeholder="Assessment overview, guidelines, and topics covered..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="text-xs rounded-xl"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Duration (Mins)
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  className="text-xs rounded-xl h-10"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Passing %
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={formPassing}
                  onChange={(e) => setFormPassing(e.target.value)}
                  className="text-xs rounded-xl h-10"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Max Attempts
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={formMaxAttempts}
                  onChange={(e) => setFormMaxAttempts(e.target.value)}
                  className="text-xs rounded-xl h-10"
                  required
                />
              </div>
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createLoading || updateLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
              >
                {createLoading || updateLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : selectedQuiz ? (
                  "Update Settings"
                ) : (
                  "Create Assessment"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Question Bank Manager Modal */}
      {selectedQuiz && (
        <QuestionModal
          isOpen={questionModalOpen}
          onClose={() => setQuestionModalOpen(false)}
          quiz={selectedQuiz}
          refetchQuizzes={refetch}
        />
      )}
    </div>
  );
};

export default AdminQuizzes;

function QuizzesSkeleton() {
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
