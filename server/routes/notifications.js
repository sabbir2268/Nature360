import express from "express";
import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, paginationMeta, parsePagination } from "../utils/helpers.js";
import { serializeNotification } from "../utils/serializers.js";

const router = express.Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20 });
    const filter = { user: req.user._id };
    if (req.query.unread === "true") filter.read = false;

    const [notifications, total, unread] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ user: req.user._id, read: false }),
    ]);

    res.json({
      notifications: notifications.map(serializeNotification),
      unread,
      pagination: paginationMeta({ page, limit, total }),
    });
  }),
);

router.get(
  "/unread-count",
  requireAuth,
  asyncHandler(async (req, res) => {
    const unread = await Notification.countDocuments({ user: req.user._id, read: false });
    res.json({ unread });
  }),
);

router.patch(
  "/:id/read",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid notification id.", code: "invalid_id" });
    }

    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found.", code: "not_found" });
    }

    if (!notification.read) {
      notification.read = true;
      notification.readAt = new Date();
      await notification.save();
    }

    res.json({ notification: serializeNotification(notification) });
  }),
);

router.post(
  "/read-all",
  requireAuth,
  asyncHandler(async (req, res) => {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true, readAt: new Date() } },
    );
    res.json({ message: "All notifications marked as read." });
  }),
);

export default router;
