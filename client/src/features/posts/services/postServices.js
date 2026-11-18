import { apiRequest } from "../../../lib/api";

export const POST_STATUSES = [
  "Submitted",
  "Under Review",
  "Verified",
  "Investigation",
  "Action Taken",
  "Resolved",
];

export const POST_CATEGORIES = [
  "Illegal Dumping",
  "Water Pollution",
  "Air Pollution",
  "Deforestation",
  "Noise Pollution",
  "Other",
];

export const POST_SEVERITIES = ["Low", "Medium", "High"];

export const RESOLUTION_ACTIONS = [
  "Confirmed",
  "Feedback",
  "Additional Evidence",
  "Reopened",
  "Incorrect Resolution",
];

/** Citizen responses are only allowed while the complaint is "Resolved". */
export const MESSAGE_REQUIRED_ACTIONS = ["Feedback", "Reopened", "Incorrect Resolution"];

export const ALLOWED_EVIDENCE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

export const MAX_EVIDENCE_BYTES = 2 * 1024 * 1024;

export async function createPost({ title, category, severity, location, description }) {
  const data = await apiRequest("/posts", {
    method: "POST",
    body: { title, category, severity, location, description },
  });

  return data.post;
}

/** Complaints are scoped to the signed-in citizen by the API. */
export async function getUserPosts() {
  const data = await apiRequest("/posts");
  return data.posts || [];
}

export async function getPost(postId) {
  const data = await apiRequest(`/posts/${postId}`);
  return data.post;
}

/** Submit a citizen resolution response (confirm, feedback, evidence, reopen, wrong). */
export async function submitResolutionResponse(postId, { action, message = "", evidence = null }) {
  const data = await apiRequest(`/posts/${postId}/responses`, {
    method: "POST",
    body: { action, message, evidence },
  });

  return { post: data.post, message: data.message || "Your response was recorded." };
}

/** Change the status of a post and record it in the history. */
export async function updatePostStatus(postId, { status, note = "" }) {
  const data = await apiRequest(`/posts/${postId}/status`, {
    method: "PATCH",
    body: { status, note },
  });
  return data.post;
}
