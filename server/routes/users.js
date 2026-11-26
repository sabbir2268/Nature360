import express from "express";
import mongoose from "mongoose";
import User, { ROLES, USER_STATUSES } from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  asyncHandler,
  escapeRegex,
  paginationMeta,
  parsePagination,
} from "../utils/helpers.js";
import { serializeUser } from "../utils/serializers.js";
import { writeAudit } from "../services/auditService.js";
import { createNotification } from "../services/notificationService.js";

const router = express.Router();
const STAFF = ["Officer", "Admin"];

/** Profile of the signed-in user (created on first request). */
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: serializeUser(req.user) });
});

/** Update the signed-in user's own profile details. */
router.patch(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name, phone } = req.body || {};

    if (name !== undefined) {
      const nextName = String(name).trim();
      if (nextName.length < 2 || nextName.length > 80) {
        return res.status(400).json({
          error: "Your name must be between 2 and 80 characters.",
          code: "invalid_name",
        });
      }
      req.user.name = nextName;
    }

    if (phone !== undefined) {
      const nextPhone = String(phone).trim();
      if (nextPhone && !/^[+0-9 ()-]{6,30}$/.test(nextPhone)) {
        return res.status(400).json({
          error: "Enter a valid phone number.",
          code: "invalid_phone",
        });
      }
      req.user.phone = nextPhone;
    }

    await req.user.save();

    await writeAudit(req, {
      action: "user.update_profile",
      entityType: "User",
      entityId: req.user._id,
      details: { fields: Object.keys(req.body || {}) },
    });

    res.json({ user: serializeUser(req.user) });
  }),
);

router.post(
  "/volunteer",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (req.user.role !== "Citizen") {
      return res.json({ user: serializeUser(req.user) });
    }

    req.user.role = "Volunteer";
    await req.user.save();

    await writeAudit(req, {
      action: "user.volunteer_register",
      entityType: "User",
      entityId: req.user._id,
      details: { email: req.user.email },
    });

    res.json({ user: serializeUser(req.user) });
  }),
);

/** Volunteers available for assignment. */
router.get(
  "/volunteers",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    const volunteers = await User.find({ role: "Volunteer", status: "Active" })
      .select("name uid role status createdAt")
      .sort({ name: 1 });

    res.json({
      volunteers: volunteers.map((user) => ({
        id: String(user._id),
        name: user.name || "Volunteer",
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      })),
    });
  }),
);

/** Admin user directory with search, role and status filters. */
router.get(
  "/",
  requireAuth,
  requireRole("Admin"),
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20 });
    const filter = {};

    if (req.query.role && req.query.role !== "All") {
      filter.role = String(req.query.role);
    }
    if (req.query.status && req.query.status !== "All") {
      filter.status = String(req.query.status);
    }
    if (req.query.search) {
      const term = escapeRegex(String(req.query.search).trim());
      if (term) {
        filter.$or = [
          { name: { $regex: term, $options: "i" } },
          { email: { $regex: term, $options: "i" } },
        ];
      }
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({
      users: users.map(serializeUser),
      pagination: paginationMeta({ page, limit, total }),
    });
  }),
);

/** Admin changes a user's role. */
router.patch(
  "/:id/role",
  requireAuth,
  requireRole("Admin"),
  asyncHandler(async (req, res) => {
    const { role } = req.body || {};

    if (!ROLES.includes(role)) {
      return res.status(400).json({
        error: `Role must be one of: ${ROLES.join(", ")}.`,
        code: "invalid_role",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid user id.", code: "invalid_id" });
    }

    const target = await User.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ error: "User not found.", code: "not_found" });
    }

    if (
      target.role === "Admin" &&
      role !== "Admin" &&
      String(target._id) === String(req.user._id)
    ) {
      return res.status(400).json({
        error: "You cannot remove your own administrator role.",
        code: "self_demote",
      });
    }

    if (target.role === "Admin" && role !== "Admin") {
      const adminCount = await User.countDocuments({ role: "Admin", status: "Active" });
      if (adminCount <= 1) {
        return res.status(400).json({
          error: "At least one administrator must remain.",
          code: "last_admin",
        });
      }
    }

    const previousRole = target.role;
    target.role = role;
    await target.save();

    await createNotification({
      userId: target._id,
      type: "system",
      title: "Your account role changed",
      message: `Your role was changed from ${previousRole} to ${role} by an administrator.`,
      link: "/dashboard",
    });

    await writeAudit(req, {
      action: "user.role_change",
      entityType: "User",
      entityId: target._id,
      details: { previousRole, role, targetEmail: target.email },
    });

    res.json({ user: serializeUser(target) });
  }),
);

/** Admin suspends or reactivates a user. */
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("Admin"),
  asyncHandler(async (req, res) => {
    const { status } = req.body || {};

    if (!USER_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Status must be one of: ${USER_STATUSES.join(", ")}.`,
        code: "invalid_status",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid user id.", code: "invalid_id" });
    }

    const target = await User.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ error: "User not found.", code: "not_found" });
    }

    if (String(target._id) === String(req.user._id) && status === "Suspended") {
      return res.status(400).json({
        error: "You cannot suspend your own account.",
        code: "self_suspend",
      });
    }

    target.status = status;
    await target.save();

    await createNotification({
      userId: target._id,
      type: "system",
      title: `Account ${status.toLowerCase()}`,
      message:
        status === "Suspended"
          ? "Your account has been suspended by an administrator."
          : "Your account has been reactivated.",
      link: "/dashboard",
    });

    await writeAudit(req, {
      action: status === "Suspended" ? "user.suspend" : "user.activate",
      entityType: "User",
      entityId: target._id,
      details: { targetEmail: target.email, status },
    });

    res.json({ user: serializeUser(target) });
  }),
);

export default router;
