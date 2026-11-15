import express from "express";
import mongoose from "mongoose";
import Post, { CATEGORIES, SEVERITIES, STATUSES } from "../models/Post.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function serializePost(post) {
  const data = post.toObject();
  data.id = String(data._id);
  data.user = String(data.user);
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
    res.json({ posts: posts.map(serializePost) });
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

export default router;
