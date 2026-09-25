import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, Send, CheckCircle2, ShieldCheck, Sparkles, MessageSquare } from "lucide-react";

/**
 * Dedicated Contact Support Modal
 * Designated zone where typing is enabled (`data-contact-input="true"`)
 */
const ContactModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    // Simulate secure transmission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success("Message sent securely! Our support team will reply within 24 hours.");
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: "", email: "", subject: "", message: "" });
        onClose();
      }, 2000);
    }, 800);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={false}>
      <DialogContent
        data-contact-container="true"
        id="contact-section"
        className="sm:max-w-[520px] p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl"
      >
        <DialogHeader className="space-y-1.5 text-left">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-sky-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white">
              Contact SkillStack Support
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Have a question, feedback, or need course assistance? Reach out to our team.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Message Received!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Your inquiry has been encrypted and delivered to the SkillStack support desk.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} id="contact-form" className="space-y-4 mt-2">
            {/* Security Notice */}
            <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/50 flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>Keypad unlocked for this Contact section. Messages are encrypted.</span>
            </div>

            {/* Name Input */}
            <div className="space-y-1">
              <Label htmlFor="contact-name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Your Full Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="contact-name"
                name="name"
                type="text"
                required
                data-contact-input="true"
                data-allow-typing="true"
                placeholder="e.g. Alex Morgan"
                value={formData.name}
                onChange={handleChange}
                className="h-10 text-xs rounded-xl"
              />
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <Label htmlFor="contact-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="contact-email"
                name="email"
                type="email"
                required
                data-contact-input="true"
                data-allow-typing="true"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="h-10 text-xs rounded-xl"
              />
            </div>

            {/* Subject Input */}
            <div className="space-y-1">
              <Label htmlFor="contact-subject" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Inquiry Topic
              </Label>
              <Input
                id="contact-subject"
                name="subject"
                type="text"
                data-contact-input="true"
                data-allow-typing="true"
                placeholder="e.g. Course enrollment / Certificate question"
                value={formData.subject}
                onChange={handleChange}
                className="h-10 text-xs rounded-xl"
              />
            </div>

            {/* Message Textarea */}
            <div className="space-y-1">
              <Label htmlFor="contact-message" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Message <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="contact-message"
                name="message"
                required
                rows={4}
                data-contact-input="true"
                data-allow-typing="true"
                placeholder="How can we help you today?"
                value={formData.message}
                onChange={handleChange}
                className="text-xs rounded-xl resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-9 px-4 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-9 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-2 cursor-pointer shadow-md"
              >
                {isSubmitting ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Inquiry</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;
