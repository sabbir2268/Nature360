import express from "express";
import Alert from "../models/Alert.js";
import Post from "../models/Post.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, escapeRegex, parseDate } from "../utils/helpers.js";

const router = express.Router();
const DAY_MS = 24 * 60 * 60 * 1000;

function buildMatch(query) {
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

function countBy(items, key) {
  return items.reduce((result, item) => {
    const value = item[key] || "Unknown";
    result[value] = (result[value] || 0) + 1;
    return result;
  }, {});
}

function toSeries(counts) {
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

router.get(
  "/summary",
  requireAuth,
  asyncHandler(async (req, res) => {
    const match = buildMatch(req.query);
    const posts = await Post.find(match)
      .select("category severity status riskLevel riskScore area createdAt updatedAt statusHistory")
      .lean();

    const total = posts.length;
    const resolved = posts.filter((post) => post.status === "Resolved");
    const active = posts.filter(
      (post) => !["Resolved", "Rejected"].includes(post.status),
    );
    const rejected = posts.filter((post) => post.status === "Rejected");

    const resolutionDays = resolved
      .map((post) => {
        const start = new Date(post.createdAt).getTime();
        const end = new Date(post.updatedAt).getTime();
        return end > start ? (end - start) / DAY_MS : 0;
      })
      .filter((days) => days > 0);

    const activeAlerts = await Alert.countDocuments({ status: "Active" });
    const areas = countBy(posts, "area");

    res.json({
      summary: {
        totalComplaints: total,
        activeComplaints: active.length,
        resolvedComplaints: resolved.length,
        rejectedComplaints: rejected.length,
        resolutionRate: total > 0 ? Math.round((resolved.length / total) * 100) : 0,
        avgResolutionDays:
          resolutionDays.length > 0
            ? Number(
                (
                  resolutionDays.reduce((sum, days) => sum + days, 0) / resolutionDays.length
                ).toFixed(1),
              )
            : 0,
        avgRiskScore:
          total > 0
            ? Math.round(
                posts.reduce((sum, post) => sum + (post.riskScore || 0), 0) / total,
              )
            : 0,
        activeAlerts,
        topAreas: toSeries(areas).slice(0, 8),
      },
      byStatus: toSeries(countBy(posts, "status")),
      byCategory: toSeries(countBy(posts, "category")),
      bySeverity: toSeries(countBy(posts, "severity")),
      byRiskLevel: toSeries(countBy(posts, "riskLevel")),
    });
  }),
);

router.get(
  "/trends",
  requireAuth,
  asyncHandler(async (req, res) => {
    const days = Math.min(365, Math.max(7, Number.parseInt(req.query.days, 10) || 30));
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (days - 1));

    const match = buildMatch(req.query);
    const posts = await Post.find({ ...match, createdAt: { ...(match.createdAt || {}), $gte: since } })
      .select("status createdAt updatedAt")
      .lean();

    const buckets = new Map();
    for (let index = 0; index < days; index += 1) {
      const date = new Date(since.getTime() + index * DAY_MS);
      const key = date.toISOString().slice(0, 10);
      buckets.set(key, { date: key, submitted: 0, resolved: 0 });
    }

    posts.forEach((post) => {
      const submittedKey = new Date(post.createdAt).toISOString().slice(0, 10);
      const submittedBucket = buckets.get(submittedKey);
      if (submittedBucket) submittedBucket.submitted += 1;

      if (post.status === "Resolved") {
        const resolvedKey = new Date(post.updatedAt).toISOString().slice(0, 10);
        const resolvedBucket = buckets.get(resolvedKey);
        if (resolvedBucket) resolvedBucket.resolved += 1;
      }
    });

    res.json({ days, series: Array.from(buckets.values()) });
  }),
);

export default router;
