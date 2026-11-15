import express from "express";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

function serializeUser(user) {
  return {
    id: String(user._id),
    uid: user.uid,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/** Profile of the signed-in user (created on first request). */
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: serializeUser(req.user) });
});

export default router;
