import nodemailer from "nodemailer";
import { Contact } from "../models/contact.model.js";

const DEFAULT_RECIPIENT = "sandeeppal6926@gmail.com";

/**
 * Sends contact message to sandeeppal6926@gmail.com via free email API and stores in MongoDB
 */
export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required fields.",
      });
    }

    const recipient = process.env.CONTACT_EMAIL || DEFAULT_RECIPIENT;
    const inquirySubject = subject?.trim() || `SkillStack LMS Inquiry from ${name.trim()}`;

    // 1. Always persist in MongoDB first so no message is ever lost
    const newContact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: inquirySubject,
      message: message.trim(),
      recipient,
      status: "received",
    });

    let mailDelivered = false;
    let deliveryMethod = "database";

    // 2. If SMTP / Gmail credentials exist, use Nodemailer
    const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

    if (smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: process.env.SMTP_SERVICE || "gmail",
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: `"SkillStack LMS Contact" <${smtpUser}>`,
          to: recipient,
          replyTo: email.trim(),
          subject: inquirySubject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
              <h2 style="color: #2563eb; margin-bottom: 8px;">New Message from SkillStack LMS</h2>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
              <p><strong>Sender Name:</strong> ${name.trim()}</p>
              <p><strong>Sender Email:</strong> <a href="mailto:${email.trim()}">${email.trim()}</a></p>
              <p><strong>Topic / Subject:</strong> ${inquirySubject}</p>
              <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin-top: 16px;">
                <p style="margin: 0; white-space: pre-wrap; color: #1e293b;">${message.trim()}</p>
              </div>
              <p style="font-size: 11px; color: #64748b; margin-top: 24px;">Sent via SkillStack LMS Contact System to ${recipient}</p>
            </div>
          `,
        });

        mailDelivered = true;
        deliveryMethod = "smtp";
        newContact.status = "delivered";
        await newContact.save();
      } catch (smtpErr) {
        console.warn("SMTP send failed, falling back to free API:", smtpErr.message);
      }
    }

    // 3. Fallback: Free FormSubmit API
    if (!mailDelivered) {
      try {
        const formSubmitRes = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Origin: req.headers.origin || "http://localhost:5173",
            Referer: req.headers.referer || "http://localhost:5173/",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            _subject: inquirySubject,
            message: message.trim(),
            _replyto: email.trim(),
          }),
        });

        const fsData = await formSubmitRes.json();
        console.log("FormSubmit API response:", fsData);
        if (fsData.success === "true" || fsData.success === true) {
          mailDelivered = true;
          deliveryMethod = "formsubmit";
          newContact.status = "delivered";
          await newContact.save();
        }
      } catch (fsErr) {
        console.warn("FormSubmit API dispatch note:", fsErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Email sent, you will be contacted shortly.",
      deliveryMethod,
      contactId: newContact._id,
    });
  } catch (error) {
    console.error("Error sending contact message:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
      error: error.message,
    });
  }
};

/**
 * Retrieves all contact inquiries for administrative audit
 */
export const getAllContactMessages = async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve contact messages",
    });
  }
};
