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

/** Change the status of a post and record it in the history. */
export async function updatePostStatus(postId, { status, note = "" }) {
  const data = await apiRequest(`/posts/${postId}/status`, {
    method: "PATCH",
    body: { status, note },
  });
  return data.post;
}
