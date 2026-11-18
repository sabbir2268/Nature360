import express from "express";
import Alert from "../models/Alert.js";
import Notification from "../models/Notification.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/helpers.js";
import { serializePost } from "../utils/serializers.js";

const router = express.Router();
const ACTIVE_STATUSES = ["Submitted", "Under Review", "Verified", "Investigation", "Action Taken"];

function scopeFilter(user) {
  const base = { isDeleted: false };
  if (user.role === "Citizen") return { ...base, user: user._id };
  if (user.role === "Volunteer") return { ...base, assignedTo: user._id };
  return base;
}

router.get(
  "/overview",
  requireAuth,
  asyncHandler(async (req, res) => {
    const filter = scopeFilter(req.user);
    const now = new Date();

    const [
      totalComplaints,
      activeComplaints,
      resolvedComplaints,
      pendingVerification,
      criticalRisk,
      unassigned,
      overdue,
      activeAlerts,
      unreadNotifications,
      recentPosts,
    ] = await Promise.all([
      Post.countDocuments(filter),
      Post.countDocuments({ ...filter, status: { $in: ACTIVE_STATUSES } }),
      Post.countDocuments({ ...filter, status: "Resolved" }),
      Post.countDocuments({ ...filter, verificationStatus: "Pending", status: { $ne: "Rejected" } }),
      Post.countDocuments({ ...filter, riskLevel: "Critical", status: { $ne: "Resolved" } }),
      Post.countDocuments({ ...filter, assignedTo: null, status: { $in: ACTIVE_STATUSES } }),
      Post.countDocuments({
        ...filter,
        deadline: { $lt: now },
        status: { $nin: ["Resolved", "Rejected"] },
      }),
      Alert.countDocuments({ status: "Active" }),
      Notification.countDocuments({ user: req.user._id, read: false }),
      Post.find(filter)
        .populate("assignedTo", "name role")
        .sort({ createdAt: -1 })
        .limit(6),
    ]);

    const stats = {
      totalComplaints,
      activeComplaints,
      resolvedComplaints,
      pendingVerification,
      criticalRisk,
      unassigned,
      overdue,
      activeAlerts,
      unreadNotifications,
      resolutionRate:
        totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0,
    };

    if (req.user.role === "Admin") {
      const [users, volunteers, officers, admins] = await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ role: "Volunteer" }),
        User.countDocuments({ role: "Officer" }),
        User.countDocuments({ role: "Admin" }),
      ]);
      stats.users = users;
      stats.volunteers = volunteers;
      stats.officers = officers;
      stats.admins = admins;
    }

    if (req.user.role === "Volunteer") {
      stats.assignedToMe = await Post.countDocuments({
        isDeleted: false,
        assignedTo: req.user._id,
        status: { $nin: ["Resolved", "Rejected"] },
      });
      stats.reportsSubmitted = await Post.countDocuments({
        isDeleted: false,
        assignedTo: req.user._id,
        "investigation.status": { $in: ["Submitted", "Completed"] },
      });
    }

    res.json({
      role: req.user.role,
      stats,
      recentComplaints: recentPosts.map((post) =>
        serializePost(post, { viewer: req.user, compact: true }),
      ),
    });
  }),
);

export default router;
