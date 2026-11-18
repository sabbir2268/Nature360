import express from "express";
import PDFDocument from "pdfkit";
import Alert from "../models/Alert.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/helpers.js";
import { writeAudit } from "../services/auditService.js";

const router = express.Router();

function countBy(items, key) {
  return items.reduce((result, item) => {
    const value = item[key] || "Unknown";
    result[value] = (result[value] || 0) + 1;
    return result;
  }, {});
}

function drawKeyValues(doc, entries) {
  entries.forEach(([label, value]) => {
    doc.font("Helvetica-Bold").fillColor("#14532d").text(`${label}: `, { continued: true });
    doc.font("Helvetica").fillColor("#1e293b").text(String(value));
  });
}

router.get(
  "/admin.pdf",
  requireAuth,
  requireRole("Admin"),
  asyncHandler(async (req, res) => {
    const [posts, users, volunteers, officers, admins, activeAlerts] = await Promise.all([
      Post.find({ isDeleted: false })
        .select("title category area status priority riskLevel createdAt authorName")
        .sort({ createdAt: -1 })
        .lean(),
      User.countDocuments({}),
      User.countDocuments({ role: "Volunteer" }),
      User.countDocuments({ role: "Officer" }),
      User.countDocuments({ role: "Admin" }),
      Alert.countDocuments({ status: "Active" }),
    ]);

    const total = posts.length;
    const resolved = posts.filter((post) => post.status === "Resolved").length;
    const rejected = posts.filter((post) => post.status === "Rejected").length;
    const active = total - resolved - rejected;
    const byStatus = countBy(posts, "status");
    const byCategory = countBy(posts, "category");
    const byRisk = countBy(posts, "riskLevel");
    const byArea = countBy(posts, "area");

    const doc = new PDFDocument({ margin: 50, size: "A4", bufferPages: true });
    const filename = `nature360-admin-report-${new Date().toISOString().slice(0, 10)}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    doc.pipe(res);

    doc.on("error", (error) => {
      console.error("PDF generation failed:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Unable to generate the report." });
      }
    });

    doc.fillColor("#052e24").font("Helvetica-Bold").fontSize(24).text("Nature360 / EcoTrack");
    doc
      .fillColor("#10b981")
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("Environmental Monitoring & Response Platform");
    doc
      .moveDown(0.5)
      .fillColor("#64748b")
      .font("Helvetica")
      .fontSize(9)
      .text(`Administrator report generated ${new Date().toLocaleString("en-GB")}`);
    doc.moveDown(1);

    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#dde8df").stroke();
    doc.moveDown(1);

    doc.fillColor("#14532d").font("Helvetica-Bold").fontSize(14).text("Platform summary");
    doc.moveDown(0.5);
    drawKeyValues(doc, [
      ["Total complaints", total],
      ["Active complaints", active],
      ["Resolved complaints", resolved],
      ["Rejected complaints", rejected],
      ["Resolution rate", `${total > 0 ? Math.round((resolved / total) * 100) : 0}%`],
      ["Registered users", users],
      ["Officers", officers],
      ["Volunteers", volunteers],
      ["Administrators", admins],
      ["Active hotspot alerts", activeAlerts],
    ]);
    doc.moveDown(1);

    const tableSection = (title, counts) => {
      doc.fillColor("#14532d").font("Helvetica-Bold").fontSize(13).text(title);
      doc.moveDown(0.4);

      const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      if (entries.length === 0) {
        doc.fillColor("#64748b").font("Helvetica").fontSize(9).text("No data available.");
      } else {
        entries.forEach(([label, value]) => {
          doc.fillColor("#1e293b").font("Helvetica").fontSize(9).text(`${label}`, { continued: true });
          doc.font("Helvetica-Bold").fillColor("#14532d").text(`  ${value}`);
        });
      }
      doc.moveDown(0.9);
    };

    tableSection("Complaints by status", byStatus);
    tableSection("Complaints by category", byCategory);
    tableSection("Complaints by risk level", byRisk);
    tableSection("Top reported areas", Object.fromEntries(Object.entries(byArea).slice(0, 10)));

    if (doc.y > 620) doc.addPage();

    doc.fillColor("#14532d").font("Helvetica-Bold").fontSize(13).text("Recent complaints");
    doc.moveDown(0.5);

    const recent = posts.slice(0, 18);
    if (recent.length === 0) {
      doc.fillColor("#64748b").font("Helvetica").fontSize(9).text("No complaints recorded yet.");
    } else {
      recent.forEach((post) => {
        if (doc.y > 730) doc.addPage();
        doc
          .fillColor("#1e293b")
          .font("Helvetica-Bold")
          .fontSize(9)
          .text(post.title.slice(0, 90));
        doc
          .fillColor("#64748b")
          .font("Helvetica")
          .fontSize(8)
          .text(
            `${post.category} | ${post.area || "No area"} | ${post.status} | ${post.riskLevel || "Low"} risk | ${new Date(post.createdAt).toLocaleDateString("en-GB")}`,
          );
        doc.moveDown(0.35);
      });
    }

    const range = doc.bufferedPageRange();
    for (let index = 0; index < range.count; index += 1) {
      doc.switchToPage(range.start + index);
      doc
        .fillColor("#94a3b8")
        .font("Helvetica")
        .fontSize(8)
        .text(
          `Nature360 administrator report - page ${index + 1} of ${range.count}`,
          50,
          800,
          { align: "center", width: 495 },
        );
    }

    doc.end();

    await writeAudit(req, {
      action: "report.export_pdf",
      entityType: "Report",
      details: { totalComplaints: total, users },
    });
  }),
);

export default router;
