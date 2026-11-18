import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/helpers.js";
import {
  getPublicSettings,
  getSettings,
  saveSettings,
} from "../services/settingsService.js";
import { writeAudit } from "../services/auditService.js";

const router = express.Router();

router.get(
  "/public",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ settings: await getPublicSettings() });
  }),
);

router.get(
  "/",
  requireAuth,
  requireRole("Admin"),
  asyncHandler(async (req, res) => {
    res.json({ settings: await getSettings() });
  }),
);

router.put(
  "/",
  requireAuth,
  requireRole("Admin"),
  asyncHandler(async (req, res) => {
    const body = req.body || {};

    if (body.categories !== undefined) {
      if (!Array.isArray(body.categories) || body.categories.length === 0) {
        return res.status(400).json({
          error: "Keep at least one environmental category.",
          code: "invalid_categories",
        });
      }
    }

    if (body.severityLevels !== undefined) {
      if (!Array.isArray(body.severityLevels) || body.severityLevels.length === 0) {
        return res.status(400).json({
          error: "Keep at least one severity level.",
          code: "invalid_severities",
        });
      }
    }

    if (body.riskRules) {
      const rules = body.riskRules;
      const weights = [
        Number(rules.frequencyWeight),
        Number(rules.severityWeight),
        Number(rules.recurrenceWeight),
        Number(rules.recencyWeight),
      ];
      if (weights.some((weight) => !Number.isFinite(weight) || weight < 0)) {
        return res.status(400).json({
          error: "Risk weights must be zero or positive numbers.",
          code: "invalid_weights",
        });
      }
      if (weights.reduce((sum, weight) => sum + weight, 0) <= 0) {
        return res.status(400).json({
          error: "At least one risk weight must be greater than zero.",
          code: "invalid_weights",
        });
      }

      const lowMax = Number(rules.lowMax);
      const moderateMax = Number(rules.moderateMax);
      const highMax = Number(rules.highMax);
      if (
        ![lowMax, moderateMax, highMax].every(Number.isFinite) ||
        !(lowMax < moderateMax && moderateMax < highMax && highMax <= 100)
      ) {
        return res.status(400).json({
          error: "Risk thresholds must increase and stay within 100.",
          code: "invalid_thresholds",
        });
      }
    }

    if (body.alertRules) {
      const { active, reportThreshold, windowDays, notifyRoles } = body.alertRules;
      if (active !== undefined && typeof active !== "boolean") {
        return res.status(400).json({
          error: "Alert active must be true or false.",
          code: "invalid_alert_rules",
        });
      }
      if (reportThreshold !== undefined) {
        const threshold = Number(reportThreshold);
        if (!Number.isInteger(threshold) || threshold < 1 || threshold > 1000) {
          return res.status(400).json({
            error: "Report threshold must be a whole number between 1 and 1000.",
            code: "invalid_threshold",
          });
        }
      }
      if (windowDays !== undefined) {
        const days = Number(windowDays);
        if (!Number.isInteger(days) || days < 1 || days > 365) {
          return res.status(400).json({
            error: "Alert window must be between 1 and 365 days.",
            code: "invalid_window",
          });
        }
      }
      if (notifyRoles !== undefined) {
        if (!Array.isArray(notifyRoles) || notifyRoles.length === 0) {
          return res.status(400).json({
            error: "Choose at least one role to notify.",
            code: "invalid_notify_roles",
          });
        }
      }
    }

    const settings = await saveSettings(body);

    await writeAudit(req, {
      action: "settings.update",
      entityType: "Setting",
      entityId: settings.key,
      details: {
        categories: settings.categories.length,
        severityLevels: settings.severityLevels.length,
        riskRules: settings.riskRules,
        alertRules: settings.alertRules,
      },
    });

    res.json({ settings });
  }),
);

export default router;
