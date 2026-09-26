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
import { Mail, Send, CheckCircle2, ShieldCheck, Sparkles, MessageSquare, Loader2 } from "lucide-react";
import { CONTACT_API } from "@/config/api.config";

const RECIPIENT_EMAIL = "sandeeppal6926@gmail.com";

/**
 * Dedicated Contact Support Modal
 * Directly delivers messages to sandeeppal6926@gmail.com
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Send to SkillStack Backend Contact API (saves to MongoDB and attempts delivery)
      const res = await fetch(`${CONTACT_API}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        }),
      });

      // 2. Also dispatch directly via free FormSubmit API for direct email forwarding to sandeeppal6926@gmail.com
      fetch(`https://formsubmit.co/ajax/${encodeURIComponent(RECIPIENT_EMAIL)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          _subject: formData.subject.trim() || `SkillStack LMS Inquiry from ${formData.name.trim()}`,
          message: formData.message.trim(),
          _replyto: formData.email.trim(),
        }),
      }).catch((err) => console.log("FormSubmit direct note:", err));

      const data = await res.json().catch(() => ({}));

      setIsSubmitting(false);
      setSubmitted(true);
      toast.success(
        data?.message || "Email sent, you will be contacted shortly."
      );

      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: "", email: "", subject: "", message: "" });
        onClose();
      }, 2500);
    } catch (err) {
      console.error("Contact send error:", err);
      // Fallback: direct browser dispatch to free email API
      try {
        await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(RECIPIENT_EMAIL)}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            _subject: formData.subject.trim() || "SkillStack Contact Inquiry",
            message: formData.message.trim(),
          }),
        });
        setIsSubmitting(false);
        setSubmitted(true);
        toast.success("Email sent, you will be contacted shortly.");
        setTimeout(() => {
          setSubmitted(false);
          setFormData({ name: "", email: "", subject: "", message: "" });
          onClose();
        }, 2500);
      } catch (fallbackErr) {
        setIsSubmitting(false);
        toast.error("Could not send message. Please try again later.");
      }
    }
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
            Have a question, feedback, or need assistance? Send us a message and our support team will get back to you shortly.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Email Sent
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Email sent, you will be contacted shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} id="contact-form" className="space-y-4 mt-2">
            {/* Security Notice */}
            <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/50 flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>Direct secure communication with our support team</span>
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
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending message...</span>
                  </>
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
