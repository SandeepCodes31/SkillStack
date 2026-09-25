import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Edit2, CheckCircle2, HelpCircle, Loader2 } from "lucide-react";
import {
  useAddQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
} from "@/features/api/quizApi";
import { toast } from "sonner";

const QuestionModal = ({ isOpen, onClose, quiz, refetchQuizzes }) => {
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOptionId, setCorrectOptionId] = useState("A");
  const [explanation, setExplanation] = useState("");

  const [addQuestionMutation, { isLoading: addLoading }] = useAddQuestionMutation();
  const [updateQuestionMutation, { isLoading: updateLoading }] = useUpdateQuestionMutation();
  const [deleteQuestionMutation, { isLoading: deleteLoading }] = useDeleteQuestionMutation();

  if (!quiz) return null;

  const resetForm = () => {
    setEditingQuestionId(null);
    setQuestionText("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectOptionId("A");
    setExplanation("");
  };

  const handleEditClick = (q) => {
    setEditingQuestionId(q._id);
    setQuestionText(q.questionText);
    const getOpt = (id) => q.options.find((o) => o.optionId === id)?.text || "";
    setOptionA(getOpt("A"));
    setOptionB(getOpt("B"));
    setOptionC(getOpt("C"));
    setOptionD(getOpt("D"));
    setCorrectOptionId(q.correctOptionId);
    setExplanation(q.explanation || "");
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!questionText.trim() || !optionA.trim() || !optionB.trim()) {
      toast.error("Please provide the question text and at least options A and B.");
      return;
    }

    const options = [
      { optionId: "A", text: optionA.trim() },
      { optionId: "B", text: optionB.trim() },
      ...(optionC.trim() ? [{ optionId: "C", text: optionC.trim() }] : []),
      ...(optionD.trim() ? [{ optionId: "D", text: optionD.trim() }] : []),
    ];

    const questionData = {
      questionText: questionText.trim(),
      options,
      correctOptionId,
      explanation: explanation.trim(),
      marks: 1,
    };

    try {
      if (editingQuestionId) {
        await updateQuestionMutation({
          quizId: quiz._id,
          questionId: editingQuestionId,
          questionData,
        }).unwrap();
        toast.success("Question updated successfully!");
      } else {
        await addQuestionMutation({
          quizId: quiz._id,
          questionData,
        }).unwrap();
        toast.success("Question added to assessment!");
      }
      resetForm();
      if (refetchQuizzes) refetchQuizzes();
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to save question.");
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await deleteQuestionMutation({
        quizId: quiz._id,
        questionId,
      }).unwrap();
      toast.success("Question deleted.");
      if (refetchQuizzes) refetchQuizzes();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete question.");
    }
  };

  const questions = quiz.questions || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold">
            Question Bank: {quiz.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Manage multiple-choice questions, options, and explanations for this final assessment.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Left Form: Add / Edit Question */}
          <Card className="border-border/70 p-4 space-y-4">
            <h4 className="font-bold text-sm text-foreground flex items-center justify-between">
              <span>{editingQuestionId ? "Edit Question" : "Add New Question"}</span>
              {editingQuestionId && (
                <Button size="xs" variant="ghost" onClick={resetForm} className="text-xs">
                  Cancel Edit
                </Button>
              )}
            </h4>

            <form onSubmit={handleSubmitQuestion} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Question Text *</Label>
                <Textarea
                  rows={2}
                  placeholder="e.g. What does HTML stand for?"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              {/* Options Inputs */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Options & Correct Answer *</Label>
                {[
                  { id: "A", val: optionA, setter: setOptionA },
                  { id: "B", val: optionB, setter: setOptionB },
                  { id: "C", val: optionC, setter: setOptionC },
                  { id: "D", val: optionD, setter: setOptionD },
                ].map((opt) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCorrectOptionId(opt.id)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold shrink-0 transition-colors border cursor-pointer ${
                        correctOptionId === opt.id
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-muted text-muted-foreground border-border/60"
                      }`}
                      title="Click to set as correct answer"
                    >
                      {opt.id}
                    </button>
                    <Input
                      placeholder={`Option ${opt.id}`}
                      value={opt.val}
                      onChange={(e) => opt.setter(e.target.value)}
                      className="text-xs h-8"
                      required={opt.id === "A" || opt.id === "B"}
                    />
                  </div>
                ))}
                <p className="text-[11px] text-muted-foreground">
                  Click the letter badge (A, B, C, D) to set it as the correct answer.
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Explanation (Revealed after submission)</Label>
                <Textarea
                  rows={2}
                  placeholder="Explain why the answer is correct..."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="text-xs"
                />
              </div>

              <Button
                type="submit"
                disabled={addLoading || updateLoading}
                className="w-full text-xs font-semibold cursor-pointer gap-1.5 h-9"
              >
                {addLoading || updateLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {editingQuestionId ? "Update Question" : "Add to Question Bank"}
              </Button>
            </form>
          </Card>

          {/* Right Column: Existing Questions List */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-foreground">
              Existing Questions ({questions.length})
            </h4>

            {questions.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-12">
                No questions added yet. Use the form on the left to add your first question.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {questions.map((q, idx) => (
                  <Card key={q._id} className="p-3 border-border/60 text-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-foreground">
                        {idx + 1}. {q.questionText}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditClick(q)}
                          className="h-6 w-6 cursor-pointer text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(q._id)}
                          className="h-6 w-6 cursor-pointer text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      {q.options.map((opt) => (
                        <div
                          key={opt.optionId}
                          className={`px-2 py-1 rounded truncate border ${
                            opt.optionId === q.correctOptionId
                              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 border-emerald-300 font-semibold"
                              : "bg-muted/40 text-muted-foreground border-border/40"
                          }`}
                        >
                          {opt.optionId}. {opt.text}
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionModal;
