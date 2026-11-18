import Notification from "../models/Notification.js";
import User from "../models/User.js";

export async function createNotification({
  userId,
  type = "system",
  title,
  message = "",
  link = "",
  relatedPost = null,
}) {
  if (!userId) return null;

  try {
    return await Notification.create({
      user: userId,
      type,
      title,
      message,
      link,
      relatedPost,
    });
  } catch (error) {
    console.error("Unable to create notification:", error.message);
    return null;
  }
}

export async function notifyRoles(roles, payload) {
  try {
    const users = await User.find({ role: { $in: roles }, status: "Active" }).select("_id").lean();
    if (users.length === 0) return [];

    return await Notification.insertMany(
      users.map((user) => ({
        user: user._id,
        type: payload.type || "system",
        title: payload.title,
        message: payload.message || "",
        link: payload.link || "",
        relatedPost: payload.relatedPost || null,
      })),
    );
  } catch (error) {
    console.error("Unable to notify roles:", error.message);
    return [];
  }
}

export function notifyPostOwner(post, payload) {
  return createNotification({
    userId: post.user?._id || post.user,
    type: payload.type || "status",
    title: payload.title,
    message: payload.message || "",
    link: payload.link || `/dashboard/track-post/${post._id}`,
    relatedPost: post._id,
  });
}
