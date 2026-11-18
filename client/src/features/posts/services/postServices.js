import { apiRequest, buildQuery } from "../../../lib/api";

export const POST_STATUSES = [
  "Submitted",
  "Under Review",
  "Verified",
  "Investigation",
  "Action Taken",
  "Resolved",
  "Rejected",
];

export const WORKFLOW_STATUSES = POST_STATUSES.filter((status) => status !== "Rejected");

export const POST_CATEGORIES = [
  "Illegal Dumping",
  "Water Pollution",
  "Air Pollution",
  "Deforestation",
  "Noise Pollution",
  "Other",
];

export const POST_SEVERITIES = ["Low", "Medium", "High", "Critical"];

export const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

export const RESOLUTION_ACTIONS = [
  "Confirmed",
  "Feedback",
  "Additional Evidence",
  "Reopened",
  "Incorrect Resolution",
];

export const MESSAGE_REQUIRED_ACTIONS = ["Feedback", "Reopened", "Incorrect Resolution"];

/** Complaints are scoped to the signed-in user by the API. */
export async function getUserPosts(params = {}) {
  const data = await apiRequest(`/posts${buildQuery(params)}`);
  return data.posts || [];
}

export async function listComplaints(params = {}) {
  const data = await apiRequest(`/posts${buildQuery(params)}`);
  return {
    posts: data.posts || [],
    pagination: data.pagination,
  };
}

export async function createPost(payload) {
  const data = await apiRequest("/posts", {
    method: "POST",
    body: payload,
  });
  return data.post;
}

export async function getPost(postId) {
  const data = await apiRequest(`/posts/${postId}`);
  return data.post;
}

export async function updatePost(postId, payload) {
  const data = await apiRequest(`/posts/${postId}`, {
    method: "PATCH",
    body: payload,
  });
  return data.post;
}

export async function deletePost(postId) {
  return apiRequest(`/posts/${postId}`, { method: "DELETE" });
}

/** Submit a citizen resolution response (confirm, feedback, evidence, reopen, wrong). */
export async function submitResolutionResponse(postId, { action, message = "", evidence = null }) {
  const data = await apiRequest(`/posts/${postId}/responses`, {
    method: "POST",
    body: { action, message, evidence },
  });

  return { post: data.post, message: data.message || "Your response was recorded." };
}

/** Legacy helper retained for officer status updates. */
export async function updatePostStatus(postId, { status, note = "" }) {
  const data = await apiRequest(`/posts/${postId}/status`, {
    method: "PATCH",
    body: { status, note },
  });
  return data.post;
}
