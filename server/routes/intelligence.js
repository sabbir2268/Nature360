import express from "express";
import mongoose from "mongoose";
import Post from "../models/Post.js";
import { isStaff, requireAuth } from "../middleware/auth.js";
import { asyncHandler, escapeRegex, parseDate } from "../utils/helpers.js";
import { getSettings } from "../services/settingsService.js";
import { buildHotspots, calculateRiskForPost } from "../services/riskService.js";

const router = express.Router();

function hotspotMatch(query) {
  const match = { isDeleted: false };

  if (query.category && query.category !== "All") match.category = query.category;
  if (query.severity && query.severity !== "All") match.severity = query.severity;
  if (query.status && query.status !== "All") match.status = query.status;
  if (query.area) {
    match.area = { $regex: escapeRegex(query.area), $options: "i" };
  }
  if (query.from || query.to) {
    match.createdAt = {};
    const from = parseDate(query.from);
    const to = parseDate(query.to);
    if (from) match.createdAt.$gte = from;
    if (to) {
      to.setHours(23, 59, 59, 999);
      match.createdAt.$lte = to;
    }
  }

  return match;
}

router.get(
  "/hotspots",
  requireAuth,
  asyncHandler(async (req, res) => {
    const settings = await getSettings();
    const match = hotspotMatch(req.query);
    const posts = await Post.find(match)
      .select("category area location coordinates severity status riskLevel createdAt")
      .sort({ createdAt: -1 })
      .lean();

    let hotspots = buildHotspots(posts, settings);

    if (req.query.riskLevel && req.query.riskLevel !== "All") {
      hotspots = hotspots.filter((hotspot) => hotspot.riskLevel === req.query.riskLevel);
    }
    if (req.query.minReports) {
      const min = Math.max(1, Number.parseInt(req.query.minReports, 10) || 1);
      hotspots = hotspots.filter((hotspot) => hotspot.reportCount >= min);
    }

    hotspots.sort((a, b) => b.riskScore - a.riskScore || b.reportCount - a.reportCount);

    res.json({
      hotspots,
      total: hotspots.length,
      scannedComplaints: posts.length,
      alertRules: {
        reportThreshold: settings.alertRules.reportThreshold,
        windowDays: settings.alertRules.windowDays,
        active: settings.alertRules.active,
      },
    });
  }),
);

router.get(
  "/areas",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [areas, locations] = await Promise.all([
      Post.distinct("area", { isDeleted: false, area: { $ne: "" } }),
      Post.distinct("location", { isDeleted: false, location: { $ne: "" } }),
    ]);

    const unique = Array.from(new Set([...areas, ...locations]))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    res.json({ areas: unique.slice(0, 300) });
  }),
);

router.get(
  "/risk/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid complaint id.", code: "invalid_id" });
    }

    const post = await Post.findById(req.params.id);
    if (!post || post.isDeleted) {
      return res.status(404).json({ error: "Complaint not found.", code: "not_found" });
    }

    const assignedId = String(post.assignedTo || "");
    const canView =
      isStaff(req.user) ||
      String(post.user) === String(req.user._id) ||
      (req.user.role === "Volunteer" && assignedId === String(req.user._id));

    if (!canView) {
      return res.status(403).json({ error: "You cannot view this risk score.", code: "forbidden" });
    }

    const settings = await getSettings();
    const risk = await calculateRiskForPost(post, settings);

    res.json({
      risk: {
        ...risk,
        storedScore: post.riskScore,
        storedLevel: post.riskLevel,
      },
    });
  }),
);

export default router;
