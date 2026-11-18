import express from "express";
import mongoose from "mongoose";
import Alert, { ALERT_STATES } from "../models/Alert.js";
import Post from "../models/Post.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler, paginationMeta, parsePagination } from "../utils/helpers.js";
import { serializeAlert } from "../utils/serializers.js";
import { getSettings } from "../services/settingsService.js";
import { checkHotspotAlert } from "../services/alertService.js";
import { writeAudit } from "../services/auditService.js";

const router = express.Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20 });
    const filter = {};

    if (req.query.status && req.query.status !== "All") filter.status = req.query.status;
    if (req.query.riskLevel && req.query.riskLevel !== "All") {
      filter.riskLevel = req.query.riskLevel;
    }
    if (req.query.category && req.query.category !== "All") {
      filter.category = req.query.category;
    }
    if (req.query.area) filter.area = req.query.area;

    const [alerts, total] = await Promise.all([
      Alert.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Alert.countDocuments(filter),
    ]);

    res.json({
      alerts: alerts.map(serializeAlert),
      pagination: paginationMeta({ page, limit, total }),
    });
  }),
);

/** Officer/Admin updates alert state. */
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("Officer", "Admin"),
  asyncHandler(async (req, res) => {
    const { status } = req.body || {};

    if (!["Acknowledged", "Resolved"].includes(status)) {
      return res.status(400).json({
        error: "Alert status must be Acknowledged or Resolved.",
        code: "invalid_status",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid alert id.", code: "invalid_id" });
    }

    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: "Alert not found.", code: "not_found" });
    }

    alert.status = status;
    if (status === "Acknowledged") {
      alert.acknowledgedBy = {
        uid: req.user.uid,
        name: req.user.name,
        role: req.user.role,
      };
      alert.acknowledgedAt = new Date();
    } else {
      alert.resolvedAt = new Date();
    }

    await alert.save();

    await writeAudit(req, {
      action: "alert.status",
      entityType: "Alert",
      entityId: alert._id,
      details: { status, category: alert.category, area: alert.area },
    });

    res.json({ alert: serializeAlert(alert) });
  }),
);

/** Manually re-run automatic hotspot detection (used by admin configuration UI). */
router.post(
  "/scan",
  requireAuth,
  requireRole("Officer", "Admin"),
  asyncHandler(async (req, res) => {
    const settings = await getSettings();
    const windowDays = Math.max(1, Number(settings.alertRules.windowDays) || 7);
    const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

    const groups = await Post.aggregate([
      { $match: { isDeleted: false, createdAt: { $gte: since } } },
      {
        $group: {
          _id: { category: "$category", area: "$area" },
          count: { $sum: 1 },
          lastId: { $last: "$_id" },
        },
      },
      { $match: { count: { $gte: Number(settings.alertRules.reportThreshold) || 10 } } },
    ]);

    let created = 0;
    for (const group of groups) {
      if (!group._id.area) continue;
      const latest = await Post.findById(group.lastId);
      if (!latest) continue;
      const alert = await checkHotspotAlert(latest, settings);
      if (alert && alert.createdAt && Date.now() - new Date(alert.createdAt).getTime() < 5000) {
        created += 1;
      }
    }

    await writeAudit(req, {
      action: "alert.scan",
      entityType: "Alert",
      details: { groups: groups.length, created },
    });

    res.json({
      message: `Hotspot scan completed. ${groups.length} hotspot group(s) checked.`,
      checked: groups.length,
      created,
    });
  }),
);

export { ALERT_STATES };
export default router;
