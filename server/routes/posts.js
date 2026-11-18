import express from "express";
import mongoose from "mongoose";
import Post, {
  CATEGORIES,
  RESOLUTION_ACTIONS,
  SEVERITIES,
  STATUSES,
} from "../models/Post.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const ALLOWED_EVIDENCE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];
const MAX_EVIDENCE_BYTES = 2 * 1024 * 1024;
const MESSAGE_REQUIRED_ACTIONS = ["Feedback", "Reopened", "Incorrect Resolution"];

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function serializePost(post, { includeEvidence = true } = {}) {
  const data = post.toObject();
  data.id = String(data._id);
  data.user = String(data.user);
  data.resolutionStatus = data.resolutionStatus || "Awaiting Citizen";
  data.citizenResponses = data.citizenResponses || [];

  if (!includeEvidence) {
    data.citizenResponses = data.citizenResponses.map((response) => ({
      ...response,
      evidence: response.evidence ? { ...response.evidence, data: "" } : null,
    }));
  }

  delete data._id;
  return data;
}

function actorFromUser(user) {
  return {
    uid: user.uid,
    name: user.name,
    role: user.role,
  };
}

/** Validates and normalizes an evidence payload sent as a base64 data URL. */
function normalizeEvidence(input) {
  if (!input || typeof input !== "object") {
    return { error: "Attach a valid evidence file." };
  }

  const name = String(input.name || "").trim().slice(0, 200);
  const mimeType = String(input.mimeType || "").trim().toLowerCase();
  const size = Number(input.size) || 0;
  const data = String(input.data || "");

  if (!name) {
    return { error: "The evidence file needs a name." };
  }

  if (!ALLOWED_EVIDENCE_TYPES.includes(mimeType)) {
    return { error: "Evidence must be a JPG, PNG, WebP, GIF or PDF file." };
  }

  if (size <= 0 || size > MAX_EVIDENCE_BYTES) {
    return { error: "Evidence must be larger than 0 bytes and no more than 2 MB." };
  }

  if (!data.startsWith("data:")) {
    return { error: "The evidence file could not be read. Please attach it again." };
  }

  return { value: { name, mimeType, size, data } };
}

/** Loads a post only if it belongs to the signed-in user. */
async function findOwnedPost(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ error: "That post id is not valid.", code: "invalid_id" });
    return null;
  }

  const post = await Post.findOne({ _id: req.params.id, user: req.user._id });
  if (!post) {
    res.status(404).json({ error: "Post not found.", code: "not_found" });
    return null;
  }

  return post;
}

/** All posts of the signed-in user, newest first. */
router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const posts = await Post.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ posts: posts.map((post) => serializePost(post, { includeEvidence: false })) });
  }),
);

/** Create a post. It always starts at "Submitted". */
router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { title, category, severity, location, description } = req.body || {};

    if (!title || String(title).trim().length < 5) {
      return res.status(400).json({
        error: "Give the post a title of at least 5 characters.",
        code: "invalid_title",
      });
    }

    if (!description || String(description).trim().length < 20) {
      return res.status(400).json({
        error: "Describe the problem with at least 20 characters.",
        code: "invalid_description",
      });
    }

    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ error: "Choose a valid category.", code: "invalid_category" });
    }

    const post = await Post.create({
      user: req.user._id,
      authorName: req.user.name,
      authorEmail: req.user.email,
      title: String(title).trim().slice(0, 160),
      category,
      severity: SEVERITIES.includes(severity) ? severity : "Medium",
      location: String(location || "").trim().slice(0, 200),
      description: String(description).trim().slice(0, 2000),
      status: "Submitted",
      statusHistory: [
        {
          status: "Submitted",
          note: "Post submitted by the citizen.",
          changedAt: new Date(),
          changedBy: actorFromUser(req.user),
        },
      ],
    });

    res.status(201).json({ post: serializePost(post) });
  }),
);

/** One post with its status history. */
router.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const post = await findOwnedPost(req, res);
    if (!post) return;
    res.json({ post: serializePost(post) });
  }),
);

/** Update the status and keep a history entry. */
router.patch(
  "/:id/status",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { status, note } = req.body || {};

    if (!STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Status must be one of: ${STATUSES.join(", ")}.`,
        code: "invalid_status",
      });
    }

    const post = await findOwnedPost(req, res);
    if (!post) return;

    if (post.status === status) {
      return res.status(400).json({
        error: `The post is already marked "${status}".`,
        code: "same_status",
      });
    }

    post.status = status;
    if (status === "Resolved") {
      post.resolutionStatus = "Awaiting Citizen";
    }
    post.statusHistory.push({
      status,
      note: String(note || "").trim().slice(0, 500) || `Status updated to ${status}.`,
      changedAt: new Date(),
      changedBy: actorFromUser(req.user),
    });

    await post.save();

    res.json({ post: serializePost(post) });
  }),
);

/**
 * Citizen response after a complaint is marked "Resolved".
 * Supports confirming the resolution, feedback, additional evidence,
 * reopening the issue and reporting an incorrect resolution.
 */
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

    const post = await findOwnedPost(req, res);
    if (!post) return;

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
        error: "Attach an evidence file (image or PDF) to submit additional evidence.",
        code: "evidence_required",
      });
    }

    const responder = actorFromUser(req.user);
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
      post.status = "Under Review";
      post.resolutionStatus = "Reopened";
      post.statusHistory.push({
        status: "Under Review",
        note: `Citizen reopened the complaint. ${trimmedMessage}`.trim().slice(0, 500),
        changedAt: new Date(),
        changedBy: responder,
      });
      flash = "The complaint was reopened and is under review again.";
    } else if (action === "Incorrect Resolution") {
      post.status = "Investigation";
      post.resolutionStatus = "Disputed";
      post.statusHistory.push({
        status: "Investigation",
        note: `Citizen reported the resolution as incorrect. ${trimmedMessage}`
          .trim()
          .slice(0, 500),
        changedAt: new Date(),
        changedBy: responder,
      });
      flash = "The incorrect resolution was reported and the complaint is under investigation.";
    } else if (action === "Feedback") {
      flash = "Your feedback was sent to the responsible team.";
    } else if (action === "Additional Evidence") {
      flash = "Your additional evidence was attached to the complaint.";
    }

    await post.save();

    res.status(201).json({ post: serializePost(post), message: flash });
  }),
);

export default router;
