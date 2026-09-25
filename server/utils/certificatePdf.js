import PDFDocument from "pdfkit";
import QRCode from "qrcode";

/**
 * Builds and streams a high-resolution, landscape A4 certificate PDF
 * with dynamic verification QR code and official SkillStack seal.
 */
export const buildCertificatePdf = async (certificate, res, baseUrl = "http://localhost:5173") => {
  const verificationUrl = `${baseUrl}/verify-certificate/${certificate.certificateId}`;

  // Generate QR code buffer
  let qrBuffer = null;
  try {
    qrBuffer = await QRCode.toBuffer(verificationUrl, {
      width: 140,
      margin: 1,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
    });
  } catch (qrErr) {
    console.error("QR Code generation error:", qrErr);
  }

  // A4 Landscape: 841.89 x 595.28 points
  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
    margins: { top: 30, bottom: 30, left: 30, right: 30 },
    info: {
      Title: `SkillStack Certificate - ${certificate.certificateId}`,
      Author: "SkillStack LMS",
      Subject: `Completion Certificate for ${certificate.courseName}`,
      Keywords: "Certificate, SkillStack, LMS, Education, Verification",
    },
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="SkillStack-Certificate-${certificate.certificateId}.pdf"`
  );

  doc.pipe(res);

  const width = doc.page.width;   // ~841.89
  const height = doc.page.height; // ~595.28

  // 1. Background Fill
  doc.rect(0, 0, width, height).fill("#FCFDFF");

  // 2. Outer Deep Navy Border (6pt thick)
  doc.lineWidth(5);
  doc.strokeColor("#0F172A");
  doc.rect(20, 20, width - 40, height - 40).stroke();

  // 3. Inner Gold Accent Border (1.5pt thick)
  doc.lineWidth(1.5);
  doc.strokeColor("#D97706");
  doc.rect(26, 26, width - 52, height - 52).stroke();

  // 4. Subtle Thin Border
  doc.lineWidth(0.5);
  doc.strokeColor("#94A3B8");
  doc.rect(30, 30, width - 60, height - 60).stroke();

  // 5. Corner Accent Boxes (Ornaments)
  const drawCorner = (x, y) => {
    doc.lineWidth(2);
    doc.strokeColor("#D97706");
    doc.rect(x, y, 14, 14).stroke();
    doc.rect(x + 3, y + 3, 8, 8).fill("#0F172A");
  };
  drawCorner(22, 22);
  drawCorner(width - 36, 22);
  drawCorner(22, height - 36);
  drawCorner(width - 36, height - 36);

  // 6. Header Branding
  doc.font("Helvetica-Bold")
    .fontSize(12)
    .fillColor("#D97706")
    .text("S K I L L S T A C K   L E A R N I N G   A C A D E M Y", 40, 52, {
      align: "center",
      characterSpacing: 3,
    });

  // 7. Main Certificate Title
  doc.font("Helvetica-Bold")
    .fontSize(28)
    .fillColor("#0F172A")
    .text("CERTIFICATE OF COMPLETION", 40, 78, {
      align: "center",
      characterSpacing: 1.5,
    });

  // Decorative Horizontal Ribbon Divider
  doc.lineWidth(1);
  doc.strokeColor("#D97706");
  doc.moveTo(width / 2 - 120, 114).lineTo(width / 2 + 120, 114).stroke();
  doc.circle(width / 2, 114, 3).fill("#D97706");

  // 8. "This is to certify that"
  doc.font("Helvetica-Oblique")
    .fontSize(12)
    .fillColor("#64748B")
    .text("THIS IS TO PROUDLY CERTIFY THAT", 40, 130, {
      align: "center",
      characterSpacing: 1.5,
    });

  // 9. Recipient Student Name
  doc.font("Helvetica-Bold")
    .fontSize(32)
    .fillColor("#1E3A8A")
    .text(certificate.studentName.toUpperCase(), 40, 155, {
      align: "center",
      characterSpacing: 1,
    });

  // Underline beneath Student Name
  doc.lineWidth(1);
  doc.strokeColor("#94A3B8");
  doc.moveTo(width / 2 - 160, 195).lineTo(width / 2 + 160, 195).stroke();

  // 10. Completion Narrative
  doc.font("Helvetica")
    .fontSize(11)
    .fillColor("#475569")
    .text(
      "has successfully mastered all modules, completed 100% of coursework, and demonstrated professional competence by passing the comprehensive final assessment for the curriculum",
      100,
      205,
      {
        align: "center",
        width: width - 200,
        lineGap: 4,
      }
    );

  // 11. Course Name (Large, highlighted)
  doc.font("Helvetica-Bold")
    .fontSize(22)
    .fillColor("#0F172A")
    .text(`"${certificate.courseName}"`, 60, 246, {
      align: "center",
      width: width - 120,
    });

  // 12. Assessment Performance Pill
  const finalScore = certificate.finalScore || 100;
  const gradeText = finalScore >= 90 ? "Grade: Distinction" : finalScore >= 75 ? "Grade: First Class" : "Grade: Passed";
  const pillY = 286;

  doc.roundedRect(width / 2 - 130, pillY, 260, 26, 13)
    .fillAndStroke("#F1F5F9", "#CBD5E1");

  doc.font("Helvetica-Bold")
    .fontSize(10.5)
    .fillColor("#0F172A")
    .text(
      `Final Score: ${finalScore}%   •   Passing Standard: 60%   •   ${gradeText}`,
      width / 2 - 130,
      pillY + 7,
      {
        align: "center",
        width: 260,
      }
    );

  // 13. Details Grid (Instructor & Issue Date)
  const metaY = 328;
  const dateFormatted = new Date(certificate.issueDate).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Left Column: Instructor
  doc.font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#0F172A")
    .text(certificate.instructorName || "Kiran (Lead Faculty)", 100, metaY, { width: 220, align: "center" });

  doc.lineWidth(1).strokeColor("#CBD5E1")
    .moveTo(110, metaY + 18).lineTo(310, metaY + 18).stroke();

  doc.font("Helvetica")
    .fontSize(9)
    .fillColor("#64748B")
    .text("Lead Course Instructor", 100, metaY + 22, { width: 220, align: "center" });

  // Center: Official Seal
  const sealX = width / 2;
  const sealY = metaY + 16;
  doc.circle(sealX, sealY, 32).fillAndStroke("#FEF3C7", "#D97706");
  doc.circle(sealX, sealY, 28).lineWidth(1).strokeColor("#B45309").stroke();
  doc.font("Helvetica-Bold")
    .fontSize(8)
    .fillColor("#92400E")
    .text("OFFICIAL", sealX - 25, sealY - 12, { width: 50, align: "center" })
    .text("★ SEAL ★", sealX - 25, sealY - 2, { width: 50, align: "center" })
    .text("VERIFIED", sealX - 25, sealY + 8, { width: 50, align: "center" });

  // Right Column: Academic Director
  doc.font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#0F172A")
    .text("Academic Review Board", width - 320, metaY, { width: 220, align: "center" });

  doc.lineWidth(1).strokeColor("#CBD5E1")
    .moveTo(width - 310, metaY + 18).lineTo(width - 110, metaY + 18).stroke();

  doc.font("Helvetica")
    .fontSize(9)
    .fillColor("#64748B")
    .text("SkillStack Certification Authority", width - 320, metaY + 22, { width: 220, align: "center" });

  // 14. Bottom Verification Strip
  const footerY = 405;
  doc.rect(40, footerY, width - 80, 130).fill("#F8FAFC");
  doc.lineWidth(1).strokeColor("#E2E8F0").rect(40, footerY, width - 80, 130).stroke();

  // QR Code on Left
  if (qrBuffer) {
    doc.image(qrBuffer, 55, footerY + 10, { width: 105, height: 105 });
  }

  // Verification Metadata in Middle
  const textX = 180;
  doc.font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#0F172A")
    .text("CREDENTIAL VERIFICATION & AUTHENTICITY", textX, footerY + 16);

  doc.font("Helvetica")
    .fontSize(9)
    .fillColor("#475569")
    .text(
      "This document represents a cryptographically recorded academic achievement on SkillStack LMS. Scan the QR code with any smartphone camera or visit the verification portal to confirm legitimacy.",
      textX,
      footerY + 34,
      { width: width - 360, lineGap: 3 }
    );

  // Metadata labels & values
  const rowY1 = footerY + 76;
  const rowY2 = footerY + 98;

  doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#64748B").text("CERTIFICATE ID:", textX, rowY1);
  doc.font("Helvetica-Bold").fontSize(10).fillColor("#1E3A8A").text(certificate.certificateId, textX + 100, rowY1);

  doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#64748B").text("VERIFICATION CODE:", textX + 310, rowY1);
  doc.font("Helvetica-Bold").fontSize(10).fillColor("#0F172A").text(certificate.verificationCode, textX + 435, rowY1);

  doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#64748B").text("DATE OF ISSUANCE:", textX, rowY2);
  doc.font("Helvetica").fontSize(9.5).fillColor("#0F172A").text(dateFormatted, textX + 115, rowY2);

  doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#64748B").text("VERIFICATION PORTAL:", textX + 310, rowY2);
  doc.font("Helvetica-Oblique").fontSize(9).fillColor("#2563EB").text(`${baseUrl}/verify-certificate`, textX + 440, rowY2);

  doc.end();
};
