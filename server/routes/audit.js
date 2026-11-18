import express from "express";
import AuditLog from "../models/AuditLog.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  asyncHandler,
  escapeRegex,
  paginationMeta,
  parsePagination,
  parseDate,
} from "../utils/helpers.js";
import { serializeAudit } from "../utils/serializers.js";

const router = express.Router();

router.get(
  "/",
  requireAuth,
  requireRole("Admin"),
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 25 });
    const filter = {};

    if (req.query.action) filter.action = req.query.action;
    if (req.query.entityType) filter.entityType = req.query.entityType;
    if (req.query.search) {
      const term = escapeRegex(String(req.query.search).trim());
      if (term) {
        filter.$or = [
          { actorName: { $regex: term, $options: "i" } },
          { action: { $regex: term, $options: "i" } },
          { entityId: { $regex: term, $options: "i" } },
        ];
      }
    }

    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      const from = parseDate(req.query.from);
      const to = parseDate(req.query.to);
      if (from) filter.createdAt.$gte = from;
      if (to) {
        to.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = to;
      }
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments(filter),
    ]);

    res.json({
      logs: logs.map(serializeAudit),
      pagination: paginationMeta({ page, limit, total }),
    });
  }),
);

export default router;
