import express from "express";
import mongoose from "mongoose";
import Post, {
  INVESTIGATION_STATES,
  PRIORITIES,
  RESOLUTION_ACTIONS,
  STATUSES,
  VERIFICATION_STATES,
} from "../models/Post.js";
import User from "../models/User.js";
import { isStaff, requireAuth, requireRole } from "../middleware/auth.js";
import {
  actorFromUser,
  asyncHandler,
  escapeRegex,
  normalizeCoordinates,
  paginationMeta,
  parseDate,
  parsePagination,
} from "../utils/helpers.js";
import { serializePost } from "../utils/serializers.js";
import {
  ALLOWED_EVIDENCE_TYPES,
  normalizeEvidence,
  normalizeEvidenceList,
} from "../services/evidenceService.js";
import {
  getSettings,
  isCategoryAllowed,
  isSeverityAllowed,
} from "../services/settingsService.js";
import { refreshPostRisk } from "../services/riskService.js";
import { writeAudit } from "../services/auditService.js";
import { checkHotspotAlert } from "../services/alertService.js";
import {
  createNotification,
  notifyPostOwner,
  notifyRoles,
} from "../services/notificationService.js";

const router = express.Router();
const STAFF = ["Officer", "Admin"];
const MESSAGE_REQUIRED_ACTIONS = ["Feedback", "Reopened", "Incorrect Resolution"];
const DAY_MS = 24 * 60 * 60 * 1000;

function actor(user) {
  return actorFromUser(user);
}

function pushStatus(post, status, note, user, changedAt = new Date()) {
  post.status = status;
  post.statusHistory.push({
    status,
    note: String(note || "").slice(0, 800),
    changedAt,
    changedBy: actor(user),
  });
}

function priorityForSeverity(severity) {
  if (severity === "Critical") return "Urgent";
  if (severity === "High") return "High";
  if (severity === "Low") return "Low";
  return "Medium";
}

function staffNotificationLink(post) {
  return `/dashboard/complaints/${post._id}`;
}

function userCanView(post, user) {
  if (isStaff(user)) return true;
  if (String(post.user?._id || post.user) === String(user._id)) return true;
  if (user.role === "Volunteer" && post.assignedTo) {
    return String(post.assignedTo?._id || post.assignedTo) === String(user._id);
  }
  return false;
}

async function findPost(req, res, { allowDeletedForStaff = false } = {}) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ error: "That complaint id is not valid.", code: "invalid_id" });
    return null;
  }

  const post = await Post.findById(req.params.id).populate("assignedTo", "name role email");

  if (!post) {
    res.status(404).json({ error: "Complaint not found.", code: "not_found" });
    return null;
  }

  if (!userCanView(post, req.user)) {
    res.status(403).json({
      error: "You do not have permission to view this complaint.",
      code: "forbidden",
    });
    return null;
  }

  if (post.isDeleted && !(allowDeletedForStaff && isStaff(req.user))) {
    res.status(404).json({ error: "Complaint not found.", code: "not_found" });
    return null;
  }

  return post;
}

function applyCommonFilters(filter, query) {
  if (query.status && query.status !== "All") {
    filter.status = String(query.status);
  }
  if (query.category && query.category !== "All") {
    filter.category = String(query.category);
  }
  if (query.severity && query.severity !== "All") {
    filter.severity = String(query.severity);
  }
  if (query.priority && query.priority !== "All") {
    filter.priority = String(query.priority);
  }
  if (query.riskLevel && query.riskLevel !== "All") {
    filter.riskLevel = String(query.riskLevel);
  }
  if (query.verification && query.verification !== "All") {
    filter.verificationStatus = String(query.verification);
  }
  if (query.isDeleted === "true") {
    filter.isDeleted = true;
  }

  if (query.area) {
    filter.$and = [
      ...(filter.$and || []),
      {
        $or: [
          { area: { $regex: `^${escapeRegex(query.area)}$`, $options: "i" } },
          { location: { $regex: escapeRegex(query.area), $options: "i" } },
        ],
      },
    ];
  }

  if (query.from || query.to) {
    filter.createdAt = {};
    const from = parseDate(query.from);
    const to = parseDate(query.to);
    if (from) filter.createdAt.$gte = from;
    if (to) {
      to.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = to;
    }
  }

  if (query.unassigned === "true") {
    filter.assignedTo = null;
  } else if (query.assignedTo && mongoose.isValidObjectId(query.assignedTo)) {
    filter.assignedTo = query.assignedTo;
  }

  if (query.search) {
    const term = escapeRegex(String(query.search).trim());
    if (term) {
      filter.$or = [
        { title: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
        { location: { $regex: term, $options: "i" } },
        { area: { $regex: term, $options: "i" } },
        { authorName: { $regex: term, $options: "i" } },
      ];
    }
  }
}

function sortFor(query) {
  if (query.sort === "oldest") return { createdAt: 1 };
  if (query.sort === "risk") return { riskScore: -1, createdAt: -1 };
  if (query.sort === "deadline") return { deadline: 1, createdAt: -1 };
  return { createdAt: -1 };
}

const PRIORITY_RANK = { Urgent: 4, High: 3, Medium: 2, Low: 1 };

async function withAssignedUsers(posts) {
  const ids = posts.map((post) => post.assignedTo).filter(Boolean);
  if (!ids.length) return posts;

  const users = await User.find({ _id: { $in: ids } }).select("name role").lean();
  const byId = new Map(users.map((user) => [String(user._id), user]));

  return posts.map((post) =>
    post.assignedTo
      ? { ...post, assignedTo: byId.get(String(post.assignedTo)) || null }
      : post,
  );
}

async function queryPosts(filter, query, { skip, limit }) {
  if (query.sort === "priority") {
    const ranked = await Post.aggregate([
      { $match: filter },
      {
        $addFields: {
          priorityRank: {
            $switch: {
              branches: Object.entries(PRIORITY_RANK).map(([priority, rank]) => ({
                case: { $eq: ["$priority", priority] },
                then: rank,
              })),
              default: 0,
            },
          },
        },
      },
      { $sort: { priorityRank: -1, riskScore: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    return withAssignedUsers(ranked);
  }

  return Post.find(filter)
    .populate("assignedTo", "name role")
    .sort(sortFor(query))
    .skip(skip)
    .limit(limit);
}

/** List complaints. Citizens see their own, volunteers their assignments, staff all. */
router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query, {
      defaultLimit: req.user.role === "Citizen" ? 100 : 20,
      maxLimit: 100,
    });

    const filter = { isDeleted: false };

    if (req.user.role === "Citizen") {
      filter.user = req.user._id;
    } else if (req.user.role === "Volunteer") {
      filter.assignedTo = req.user._id;
    } else if (isStaff(req.user) && req.query.isDeleted === "true") {
      filter.isDeleted = true;
    }

    applyCommonFilters(filter, req.query);

    const [posts, total] = await Promise.all([
      queryPosts(filter, req.query, { skip, limit }),
      Post.countDocuments(filter),
    ]);

    res.json({
      posts: posts.map((post) => serializePost(post, { viewer: req.user, compact: true })),
      pagination: paginationMeta({ page, limit, total }),
    });
  }),
);

/** Volunteer's assigned cases (explicit alias used by the volunteer workspace). */
router.get(
  "/assigned",
  requireAuth,
  requireRole("Volunteer"),
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = { isDeleted: false, assignedTo: req.user._id };
    applyCommonFilters(filter, req.query);

    const [posts, total] = await Promise.all([
      queryPosts(filter, req.query, { skip, limit }),
      Post.countDocuments(filter),
    ]);

    res.json({
      posts: posts.map((post) => serializePost(post, { viewer: req.user, compact: true })),
      pagination: paginationMeta({ page, limit, total }),
    });
  }),
);

/** Submit a new environmental complaint. */
router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const settings = await getSettings();
    const body = req.body || {};
    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const category = String(body.category || "").trim();
    const severity = String(body.severity || "Medium").trim();
    const location = String(body.location || "").trim().slice(0, 300);
    const area = String(body.area || "").trim().slice(0, 120) || location;
    const priorityInput = String(body.priority || "").trim();

    if (title.length < 5) {
      return res.status(400).json({
        error: "Give the complaint a title of at least 5 characters.",
        code: "invalid_title",
      });
    }

    if (description.length < 20) {
      return res.status(400).json({
        error: "Describe the problem with at least 20 characters.",
        code: "invalid_description",
      });
    }

    if (!isCategoryAllowed(settings, category)) {
      return res.status(400).json({ error: "Choose a valid category.", code: "invalid_category" });
    }

    if (!isSeverityAllowed(settings, severity)) {
      return res.status(400).json({ error: "Choose a valid severity.", code: "invalid_severity" });
    }

    const coordinates = normalizeCoordinates(body.coordinates);
    if (coordinates.error) {
      return res.status(400).json({ error: coordinates.error, code: "invalid_coordinates" });
    }

    const evidence = normalizeEvidenceList(body.evidence);
    if (evidence.error) {
      return res.status(400).json({ error: evidence.error, code: "invalid_evidence" });
    }

    const post = await Post.create({
      user: req.user._id,
      authorName: req.user.name,
      authorEmail: req.user.email,
      title: title.slice(0, 160),
      category,
      severity,
      priority: PRIORITIES.includes(priorityInput)
        ? priorityInput
        : priorityForSeverity(severity),
      location,
      area,
      coordinates,
      description: description.slice(0, 2000),
      incidentAt: parseDate(body.incidentAt),
      evidence: evidence.values,
      status: "Submitted",
      verificationStatus: "Pending",
      statusHistory: [
        {
          status: "Submitted",
          note: "Complaint submitted by the citizen.",
          changedAt: new Date(),
          changedBy: actor(req.user),
        },
      ],
    });

    await refreshPostRisk(post, settings);
    await post.save();

    await checkHotspotAlert(post, settings);

    await notifyRoles(STAFF, {
      type: "status",
      title: "New environmental complaint submitted",
      message: `${post.title} (${post.category}) in ${post.area || "an unlisted area"}.`,
      link: staffNotificationLink(post),
      relatedPost: post._id,
    });

    await writeAudit(req, {
      action: "complaint.create",
      entityType: "Post",
      entityId: post._id,
      details: { title: post.title, category: post.category, severity: post.severity },
    });

    res.status(201).json({ post: serializePost(post, { viewer: req.user }) });
  }),
);

/** Single complaint with full history, evidence and role-appropriate details. */
router.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const post = await findPost(req, res, { allowDeletedForStaff: true });
    if (!post) return;
    res.json({ post: serializePost(post, { viewer: req.user }) });
  }),
);

/** Citizen edits their own complaint before it is closed. */
router.patch(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const post = await findPost(req, res);
    if (!post) return;

    const isOwner = String(post.user) === String(req.user._id);
    if (!isOwner && !isStaff(req.user)) {
      return res.status(403).json({ error: "You cannot edit this complaint.", code: "forbidden" });
    }

    if (!["Submitted", "Under Review", "Rejected"].includes(post.status)) {
      return res.status(409).json({
        error: "This complaint can no longer be edited because it is already being actioned.",
        code: "not_editable",
      });
    }

    const settings = await getSettings();
    const body = req.body || {};

    if (body.title !== undefined) {
      const title = String(body.title).trim();
      if (title.length < 5) {
        return res.status(400).json({
          error: "Give the complaint a title of at least 5 characters.",
          code: "invalid_title",
        });
      }
      post.title = title.slice(0, 160);
    }

    if (body.description !== undefined) {
      const description = String(body.description).trim();
      if (description.length < 20) {
        return res.status(400).json({
          error: "Describe the problem with at least 20 characters.",
          code: "invalid_description",
        });
      }
      post.description = description.slice(0, 2000);
    }

    if (body.category !== undefined) {
      const category = String(body.category).trim();
      if (!isCategoryAllowed(settings, category)) {
        return res.status(400).json({ error: "Choose a valid category.", code: "invalid_category" });
      }
      post.category = category;
    }

    if (body.severity !== undefined) {
      const severity = String(body.severity).trim();
      if (!isSeverityAllowed(settings, severity)) {
        return res.status(400).json({ error: "Choose a valid severity.", code: "invalid_severity" });
      }
      post.severity = severity;
      post.priority = priorityForSeverity(severity);
    }

    if (body.priority !== undefined && PRIORITIES.includes(body.priority)) {
      post.priority = body.priority;
    }

    if (body.location !== undefined) {
      post.location = String(body.location).trim().slice(0, 300);
      post.area = String(body.area || post.location).trim().slice(0, 120);
    }

    if (body.area !== undefined) {
      post.area = String(body.area).trim().slice(0, 120);
    }

    if (body.coordinates !== undefined) {
      const coordinates = normalizeCoordinates(body.coordinates);
      if (coordinates.error) {
        return res.status(400).json({ error: coordinates.error, code: "invalid_coordinates" });
      }
      post.coordinates = coordinates;
    }

    if (body.incidentAt !== undefined) {
      post.incidentAt = parseDate(body.incidentAt);
    }

    if (body.evidence !== undefined) {
      const evidence = normalizeEvidenceList(body.evidence);
      if (evidence.error) {
        return res.status(400).json({ error: evidence.error, code: "invalid_evidence" });
      }
      post.evidence = evidence.values;
    }

    if (post.status === "Rejected") {
      post.status = "Under Review";
      post.verificationStatus = "Pending";
      post.rejectionReason = "";
      post.statusHistory.push({
        status: "Under Review",
        note: "Citizen updated the rejected complaint for another review.",
        changedAt: new Date(),
        changedBy: actor(req.user),
      });

      await notifyRoles(STAFF, {
        type: "status",
        title: "Rejected complaint resubmitted",
        message: `${post.title} was updated and is waiting for review again.`,
        link: staffNotificationLink(post),
        relatedPost: post._id,
      });
    }

    await refreshPostRisk(post, settings);
    await post.save();

    await writeAudit(req, {
      action: "complaint.update",
      entityType: "Post",
      entityId: post._id,
      details: { fields: Object.keys(body) },
    });

    res.json({ post: serializePost(post, { viewer: req.user }) });
  }),
);

/** Soft delete. Complaint records are never removed from the database. */
router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const post = await findPost(req, res);
    if (!post) return;

    const isOwner = String(post.user) === String(req.user._id);
    if (!isOwner && req.user.role !== "Admin") {
      return res.status(403).json({ error: "You cannot delete this complaint.", code: "forbidden" });
    }

    if (isOwner && !isStaff(req.user) && !["Submitted", "Under Review", "Rejected"].includes(post.status)) {
      return res.status(409).json({
        error: "Complaints already under investigation cannot be deleted. Contact an officer instead.",
        code: "not_deletable",
      });
    }

    post.isDeleted = true;
    post.deletedAt = new Date();
    post.deletedBy = actor(req.user);
    await post.save();

    await writeAudit(req, {
      action: "complaint.soft_delete",
      entityType: "Post",
      entityId: post._id,
      details: { title: post.title, status: post.status },
    });

    res.json({ message: "The complaint was removed from active records." });
  }),
);

/** Officer/Admin updates status and optionally records a corrective action. */
router.patch(
  "/:id/status",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    const { status, note, correctiveAction } = req.body || {};

    if (!STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Status must be one of: ${STATUSES.join(", ")}.`,
        code: "invalid_status",
      });
    }

    const post = await findPost(req, res);
    if (!post) return;

    if (post.status === status) {
      return res.status(400).json({
        error: `The complaint is already marked "${status}".`,
        code: "same_status",
      });
    }

    if (status === "Rejected" && !String(note || "").trim()) {
      return res.status(400).json({
        error: "Add a reason before rejecting a complaint.",
        code: "reason_required",
      });
    }

    pushStatus(
      post,
      status,
      String(note || "").trim() || `Status updated to ${status}.`,
      req.user,
    );

    if (status === "Verified") {
      post.verificationStatus = "Verified";
    }
    if (status === "Rejected") {
      post.verificationStatus = "Rejected";
      post.rejectionReason = String(note || "").slice(0, 500);
    }
    if (status === "Resolved") {
      post.resolutionStatus = "Awaiting Citizen";
      if (String(correctiveAction || "").trim()) {
        post.correctiveActions.push({
          action: String(correctiveAction).trim().slice(0, 300),
          note: String(note || "").slice(0, 1000),
          performedAt: new Date(),
          performedBy: actor(req.user),
        });
      }
    }

    const settings = await getSettings();
    await refreshPostRisk(post, settings);
    await post.save();

    await notifyPostOwner(post, {
      type: "status",
      title: `Complaint status updated to ${status}`,
      message: `"${post.title}" is now ${status}. ${String(note || "").trim()}`.trim(),
    });

    if (status === "Verified") {
      await checkHotspotAlert(post, settings);
    }

    await writeAudit(req, {
      action: "complaint.status",
      entityType: "Post",
      entityId: post._id,
      details: { status, note: String(note || ""), correctiveAction: Boolean(correctiveAction) },
    });

    res.json({ post: serializePost(post, { viewer: req.user }) });
  }),
);

/** Citizen response after the complaint is Resolved (FR-04). */
router.post(
  "/:id/responses",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { action, message, evidence } = req.body || {};

    if (!RESOLUTION_ACTIONS.includes(action)) {
      return res.status(400).json({
        error: `Action must be one of: ${RESOLUTION_ACTIONS.join(", ")}.`,
        code: "invalid_action",
      });
    }

    const post = await findPost(req, res);
    if (!post) return;

    if (String(post.user) !== String(req.user._id)) {
      return res.status(403).json({
        error: "Only the citizen who reported this complaint can respond.",
        code: "forbidden",
      });
    }

    if (post.status !== "Resolved") {
      return res.status(409).json({
        error: "You can only respond once this complaint is marked as Resolved.",
        code: "not_resolved",
      });
    }

    if (action === "Confirmed" && post.resolutionStatus === "Confirmed") {
      return res.status(409).json({
        error: "You have already confirmed this resolution.",
        code: "already_confirmed",
      });
    }

    const trimmedMessage = String(message || "").trim().slice(0, 1000);

    if (MESSAGE_REQUIRED_ACTIONS.includes(action) && trimmedMessage.length < 10) {
      return res.status(400).json({
        error: "Add a short explanation of at least 10 characters.",
        code: "invalid_message",
      });
    }

    const normalizedEvidence = evidence ? normalizeEvidence(evidence) : null;
    if (normalizedEvidence?.error) {
      return res.status(400).json({
        error: normalizedEvidence.error,
        code: "invalid_evidence",
      });
    }

    if (action === "Additional Evidence" && !normalizedEvidence?.value) {
      return res.status(400).json({
        error: "Attach an evidence file (image, video or PDF) to submit additional evidence.",
        code: "evidence_required",
      });
    }

    const responder = actor(req.user);
    const response = {
      action,
      message: trimmedMessage,
      respondedAt: new Date(),
      respondedBy: responder,
    };
    if (normalizedEvidence?.value) response.evidence = normalizedEvidence.value;
    post.citizenResponses.push(response);

    let flash = "Your response was recorded.";

    if (action === "Confirmed") {
      post.resolutionStatus = "Confirmed";
      flash = "Thank you. You confirmed that this complaint has been resolved.";
    } else if (action === "Reopened") {
      pushStatus(
        post,
        "Under Review",
        `Citizen reopened the complaint. ${trimmedMessage}`.trim(),
        req.user,
      );
      post.resolutionStatus = "Reopened";
      flash = "The complaint was reopened and is under review again.";
    } else if (action === "Incorrect Resolution") {
      pushStatus(
        post,
        "Investigation",
        `Citizen reported the resolution as incorrect. ${trimmedMessage}`.trim(),
        req.user,
      );
      post.resolutionStatus = "Disputed";
      flash = "The incorrect resolution was reported and the complaint is under investigation.";
    } else if (action === "Feedback") {
      flash = "Your feedback was sent to the responsible team.";
    } else if (action === "Additional Evidence") {
      flash = "Your additional evidence was attached to the complaint.";
    }

    const settings = await getSettings();
    await refreshPostRisk(post, settings);
    await post.save();

    const recipient = post.assignedTo || null;
    if (recipient) {
      await createNotification({
        userId: recipient,
        type: "resolution",
        title: `Citizen response: ${action}`,
        message: `"${post.title}" received a new citizen response.`,
        link: "/dashboard/assigned",
        relatedPost: post._id,
      });
    } else {
      await notifyRoles(STAFF, {
        type: "resolution",
        title: `Citizen response: ${action}`,
        message: `"${post.title}" received a new citizen response.`,
        link: staffNotificationLink(post),
        relatedPost: post._id,
      });
    }

    await writeAudit(req, {
      action: "complaint.citizen_response",
      entityType: "Post",
      entityId: post._id,
      details: { action, hasEvidence: Boolean(normalizedEvidence?.value) },
    });

    res.status(201).json({ post: serializePost(post, { viewer: req.user }), message: flash });
  }),
);

/** Officer/Admin verifies or rejects a complaint and sets triage fields. */
router.post(
  "/:id/verify",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    const { decision, category, severity, priority, note, reason } = req.body || {};

    if (!["Verified", "Rejected"].includes(decision)) {
      return res.status(400).json({
        error: "Decision must be Verified or Rejected.",
        code: "invalid_decision",
      });
    }

    const post = await findPost(req, res);
    if (!post) return;

    if (["Resolved", "Rejected"].includes(post.status) && decision === "Rejected") {
      return res.status(409).json({
        error: "This complaint is already closed or rejected.",
        code: "closed",
      });
    }

    const settings = await getSettings();

    if (decision === "Rejected") {
      const rejectionReason = String(reason || note || "").trim();
      if (rejectionReason.length < 10) {
        return res.status(400).json({
          error: "Give a rejection reason of at least 10 characters.",
          code: "reason_required",
        });
      }

      post.verificationStatus = "Rejected";
      post.rejectionReason = rejectionReason.slice(0, 500);
      pushStatus(post, "Rejected", `Complaint rejected: ${rejectionReason}`, req.user);
    } else {
      if (category !== undefined) {
        const nextCategory = String(category).trim();
        if (!isCategoryAllowed(settings, nextCategory)) {
          return res.status(400).json({ error: "Choose a valid category.", code: "invalid_category" });
        }
        post.category = nextCategory;
      }

      if (severity !== undefined) {
        const nextSeverity = String(severity).trim();
        if (!isSeverityAllowed(settings, nextSeverity)) {
          return res.status(400).json({ error: "Choose a valid severity.", code: "invalid_severity" });
        }
        post.severity = nextSeverity;
        if (!priority) post.priority = priorityForSeverity(nextSeverity);
      }

      if (priority !== undefined && PRIORITIES.includes(priority)) {
        post.priority = priority;
      }

      post.verificationStatus = "Verified";
      post.rejectionReason = "";
      if (["Submitted", "Under Review"].includes(post.status)) {
        pushStatus(
          post,
          "Verified",
          String(note || "").trim() || "Complaint verified by an environmental officer.",
          req.user,
        );
      } else {
        post.statusHistory.push({
          status: post.status,
          note: String(note || "").trim() || "Complaint verification details updated.",
          changedAt: new Date(),
          changedBy: actor(req.user),
        });
      }
    }

    post.internalNotes.push({
      note: String(note || reason || "").trim() || `Complaint marked ${decision}.`,
      addedAt: new Date(),
      addedBy: actor(req.user),
    });

    await refreshPostRisk(post, settings);
    await post.save();

    await notifyPostOwner(post, {
      type: "verification",
      title: `Complaint ${decision.toLowerCase()}`,
      message:
        decision === "Verified"
          ? `"${post.title}" was verified. Severity is ${post.severity} and priority is ${post.priority}.`
          : `"${post.title}" was rejected: ${post.rejectionReason}`,
    });

    if (decision === "Verified") {
      await checkHotspotAlert(post, settings);
    }

    await writeAudit(req, {
      action: decision === "Verified" ? "complaint.verify" : "complaint.reject",
      entityType: "Post",
      entityId: post._id,
      details: {
        category: post.category,
        severity: post.severity,
        priority: post.priority,
        reason: post.rejectionReason,
      },
    });

    res.json({ post: serializePost(post, { viewer: req.user }) });
  }),
);

function haversineKm(a, b) {
  if (!a || !b || a.lat === null || a.lng === null || b.lat === null || b.lng === null) {
    return null;
  }
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

function titleTokens(title) {
  return new Set(
    String(title || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3),
  );
}

function tokenOverlap(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  a.forEach((word) => {
    if (b.has(word)) shared += 1;
  });
  return shared / Math.max(a.size, b.size);
}

/** Potential duplicate detection for officers. */
router.get(
  "/:id/duplicates",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    const post = await findPost(req, res);
    if (!post) return;

    const since = new Date(Date.now() - 30 * DAY_MS);
    const candidates = await Post.find({
      _id: { $ne: post._id },
      isDeleted: false,
      category: post.category,
      createdAt: { $gte: since },
    })
      .select("title description location area coordinates severity status createdAt authorName")
      .sort({ createdAt: -1 })
      .limit(60)
      .lean();

    const postTokens = titleTokens(post.title);
    const scored = candidates
      .map((candidate) => {
        const distanceKm = haversineKm(post.coordinates, candidate.coordinates);
        const sameArea =
          Boolean(post.area) &&
          String(candidate.area || "").toLowerCase() === String(post.area).toLowerCase();
        const titleScore = tokenOverlap(postTokens, titleTokens(candidate.title));
        const descriptionScore = tokenOverlap(
          titleTokens(post.description),
          titleTokens(candidate.description),
        );

        let score = 20;
        const reasons = ["Same category"];

        if (distanceKm !== null && distanceKm <= 1) {
          score += 40;
          reasons.push("Within 1 km");
        } else if (distanceKm !== null && distanceKm <= 3) {
          score += 20;
          reasons.push("Within 3 km");
        }

        if (sameArea) {
          score += 25;
          reasons.push("Same area");
        }

        if (titleScore >= 0.3) {
          score += Math.round(titleScore * 30);
          reasons.push("Similar title");
        }

        if (descriptionScore >= 0.3) {
          score += Math.round(descriptionScore * 10);
          reasons.push("Similar description");
        }

        return {
          post: candidate,
          score: Math.min(100, score),
          distanceKm: distanceKm === null ? null : Number(distanceKm.toFixed(2)),
          reasons,
        };
      })
      .filter((item) => item.score >= 40)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    res.json({
      duplicates: scored.map((item) => ({
        id: String(item.post._id),
        title: item.post.title,
        location: item.post.location,
        area: item.post.area,
        status: item.post.status,
        severity: item.post.severity,
        authorName: item.post.authorName,
        createdAt: item.post.createdAt,
        score: item.score,
        distanceKm: item.distanceKm,
        reasons: item.reasons,
      })),
    });
  }),
);

/** Assign a verified case to a volunteer with a deadline. */
router.post(
  "/:id/assign",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    const { volunteerId, deadline, note } = req.body || {};

    if (!mongoose.isValidObjectId(volunteerId)) {
      return res.status(400).json({
        error: "Choose a valid volunteer.",
        code: "invalid_volunteer",
      });
    }

    const volunteer = await User.findOne({
      _id: volunteerId,
      role: "Volunteer",
      status: "Active",
    });

    if (!volunteer) {
      return res.status(404).json({
        error: "That volunteer could not be found.",
        code: "volunteer_not_found",
      });
    }

    const parsedDeadline = parseDate(deadline);
    if (deadline && !parsedDeadline) {
      return res.status(400).json({
        error: "The deadline is not a valid date.",
        code: "invalid_deadline",
      });
    }

    const post = await findPost(req, res);
    if (!post) return;

    if (post.status === "Resolved" || post.status === "Rejected") {
      return res.status(409).json({
        error: "Resolved or rejected complaints cannot be assigned.",
        code: "closed",
      });
    }

    post.assignedTo = volunteer._id;
    post.assignedBy = actor(req.user);
    post.assignedAt = new Date();
    post.deadline = parsedDeadline;
    if (!post.investigation.startedAt) post.investigation.startedAt = new Date();
    if (post.investigation.status === "Pending") post.investigation.status = "In Progress";

    if (!["Investigation", "Action Taken", "Resolved"].includes(post.status)) {
      pushStatus(
        post,
        "Investigation",
        String(note || "").trim() ||
          `Assigned to volunteer ${volunteer.name}${parsedDeadline ? `, due ${parsedDeadline.toISOString().slice(0, 10)}` : ""}.`,
        req.user,
      );
    } else {
      post.statusHistory.push({
        status: post.status,
        note: `Reassigned to volunteer ${volunteer.name}.`,
        changedAt: new Date(),
        changedBy: actor(req.user),
      });
    }

    await post.save();
    await post.populate("assignedTo", "name role email");

    await createNotification({
      userId: volunteer._id,
      type: "assignment",
      title: "New investigation assigned",
      message: `"${post.title}" has been assigned to you${parsedDeadline ? ` with a deadline of ${parsedDeadline.toDateString()}` : ""}.`,
      link: `/dashboard/assigned/${post._id}`,
      relatedPost: post._id,
    });

    await notifyPostOwner(post, {
      type: "assignment",
      title: "Your complaint is being investigated",
      message: `"${post.title}" was assigned to a field volunteer.`,
    });

    await writeAudit(req, {
      action: "complaint.assign",
      entityType: "Post",
      entityId: post._id,
      details: {
        volunteerId: String(volunteer._id),
        volunteerName: volunteer.name,
        deadline: parsedDeadline,
      },
    });

    res.json({ post: serializePost(post, { viewer: req.user }) });
  }),
);

/** Officer/Admin internal notes. Never exposed to citizens or volunteers. */
router.post(
  "/:id/notes",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    const note = String(req.body?.note || "").trim();

    if (note.length < 2) {
      return res.status(400).json({
        error: "Write an internal note first.",
        code: "invalid_note",
      });
    }

    const post = await findPost(req, res);
    if (!post) return;

    post.internalNotes.push({
      note: note.slice(0, 1500),
      addedAt: new Date(),
      addedBy: actor(req.user),
    });
    await post.save();

    await writeAudit(req, {
      action: "complaint.internal_note",
      entityType: "Post",
      entityId: post._id,
      details: { noteLength: note.length },
    });

    res.status(201).json({ post: serializePost(post, { viewer: req.user }) });
  }),
);

/** Record a corrective action and optionally move the complaint forward. */
router.post(
  "/:id/corrective-actions",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    const action = String(req.body?.action || "").trim();
    const note = String(req.body?.note || "").trim();

    if (action.length < 3) {
      return res.status(400).json({
        error: "Describe the corrective action.",
        code: "invalid_action",
      });
    }

    const post = await findPost(req, res);
    if (!post) return;

    post.correctiveActions.push({
      action: action.slice(0, 300),
      note: note.slice(0, 1000),
      performedAt: new Date(),
      performedBy: actor(req.user),
    });

    if (!["Action Taken", "Resolved", "Rejected"].includes(post.status)) {
      pushStatus(
        post,
        "Action Taken",
        note || `Corrective action recorded: ${action}`,
        req.user,
      );
    } else {
      post.statusHistory.push({
        status: post.status,
        note: `Corrective action recorded: ${action}`,
        changedAt: new Date(),
        changedBy: actor(req.user),
      });
    }

    const settings = await getSettings();
    await refreshPostRisk(post, settings);
    await post.save();

    await notifyPostOwner(post, {
      type: "status",
      title: "Corrective action recorded",
      message: `"${post.title}": ${action}`,
    });

    await writeAudit(req, {
      action: "complaint.corrective_action",
      entityType: "Post",
      entityId: post._id,
      details: { action },
    });

    res.status(201).json({ post: serializePost(post, { viewer: req.user }) });
  }),
);

/** Volunteer updates investigation status, observations, GPS and evidence. */
router.patch(
  "/:id/investigation",
  requireAuth,
  asyncHandler(async (req, res) => {
    const post = await findPost(req, res);
    if (!post) return;

    const assignedId = String(post.assignedTo?._id || post.assignedTo || "");
    const isAssignedVolunteer =
      req.user.role === "Volunteer" && assignedId === String(req.user._id);

    if (!isAssignedVolunteer && !isStaff(req.user)) {
      return res.status(403).json({
        error: "Only the assigned volunteer or an officer can update this investigation.",
        code: "forbidden",
      });
    }

    if (post.status === "Resolved") {
      return res.status(409).json({
        error: "This complaint is already resolved.",
        code: "closed",
      });
    }

    const body = req.body || {};

    if (body.status !== undefined) {
      if (!INVESTIGATION_STATES.includes(body.status)) {
        return res.status(400).json({
          error: `Investigation status must be one of: ${INVESTIGATION_STATES.join(", ")}.`,
          code: "invalid_investigation_status",
        });
      }
      post.investigation.status = body.status;
      if (!post.investigation.startedAt) post.investigation.startedAt = new Date();
    }

    if (body.observations !== undefined) {
      post.investigation.observations = String(body.observations).slice(0, 4000);
    }

    if (body.gps !== undefined) {
      const coordinates = normalizeCoordinates(body.gps);
      if (coordinates.error) {
        return res.status(400).json({ error: coordinates.error, code: "invalid_coordinates" });
      }
      post.investigation.gps = {
        lat: coordinates.lat,
        lng: coordinates.lng,
        accuracy: Number(body.gps?.accuracy) || null,
      };
    }

    if (body.evidence !== undefined) {
      const evidence = normalizeEvidenceList(body.evidence);
      if (evidence.error) {
        return res.status(400).json({ error: evidence.error, code: "invalid_evidence" });
      }
      post.investigation.evidence.push(...evidence.values);
    }

    if (post.status !== "Investigation" && !["Resolved", "Rejected"].includes(post.status)) {
      pushStatus(
        post,
        "Investigation",
        "Field investigation started by the assigned volunteer.",
        req.user,
      );
    }

    await post.save();

    await writeAudit(req, {
      action: "investigation.update",
      entityType: "Post",
      entityId: post._id,
      details: { status: post.investigation.status },
    });

    res.json({ post: serializePost(post, { viewer: req.user }) });
  }),
);

/** Volunteer submits the final investigation report. */
router.post(
  "/:id/investigation/report",
  requireAuth,
  asyncHandler(async (req, res) => {
    const report = String(req.body?.report || "").trim();
    const observations = String(req.body?.observations || "").trim();
    const post = await findPost(req, res);
    if (!post) return;

    const assignedId = String(post.assignedTo?._id || post.assignedTo || "");
    const isAssignedVolunteer =
      req.user.role === "Volunteer" && assignedId === String(req.user._id);

    if (!isAssignedVolunteer && !isStaff(req.user)) {
      return res.status(403).json({
        error: "Only the assigned volunteer or an officer can submit this report.",
        code: "forbidden",
      });
    }

    if (report.length < 20) {
      return res.status(400).json({
        error: "Write an investigation report of at least 20 characters.",
        code: "invalid_report",
      });
    }

    if (req.body?.gps !== undefined) {
      const coordinates = normalizeCoordinates(req.body.gps);
      if (coordinates.error) {
        return res.status(400).json({ error: coordinates.error, code: "invalid_coordinates" });
      }
      post.investigation.gps = {
        lat: coordinates.lat,
        lng: coordinates.lng,
        accuracy: Number(req.body.gps?.accuracy) || null,
      };
    }

    if (req.body?.evidence !== undefined) {
      const evidence = normalizeEvidenceList(req.body.evidence);
      if (evidence.error) {
        return res.status(400).json({ error: evidence.error, code: "invalid_evidence" });
      }
      post.investigation.evidence.push(...evidence.values);
    }

    post.investigation.status = "Submitted";
    post.investigation.report = report.slice(0, 6000);
    if (observations) post.investigation.observations = observations.slice(0, 4000);
    post.investigation.submittedAt = new Date();
    post.investigation.submittedBy = actor(req.user);

    if (!["Investigation", "Action Taken", "Resolved"].includes(post.status)) {
      pushStatus(
        post,
        "Investigation",
        "Investigation report submitted by the field volunteer.",
        req.user,
      );
    } else {
      post.statusHistory.push({
        status: post.status,
        note: "Investigation report submitted by the field volunteer.",
        changedAt: new Date(),
        changedBy: actor(req.user),
      });
    }

    await post.save();

    await notifyRoles(STAFF, {
      type: "investigation",
      title: "Investigation report submitted",
      message: `"${post.title}" has a new field investigation report.`,
      link: staffNotificationLink(post),
      relatedPost: post._id,
    });

    await notifyPostOwner(post, {
      type: "investigation",
      title: "Investigation report submitted",
      message: `A field volunteer submitted an investigation report for "${post.title}".`,
    });

    await writeAudit(req, {
      action: "investigation.report",
      entityType: "Post",
      entityId: post._id,
      details: { reportLength: report.length },
    });

    res.status(201).json({ post: serializePost(post, { viewer: req.user }) });
  }),
);

export default router;
