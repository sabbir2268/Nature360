import { apiRequest, buildQuery } from "../../../lib/api";

export async function listAssignedCases(params = {}) {
  const data = await apiRequest(`/posts/assigned${buildQuery(params)}`);
  return {
    posts: data.posts || [],
    pagination: data.pagination,
  };
}

export async function updateInvestigation(postId, payload) {
  const data = await apiRequest(`/posts/${postId}/investigation`, {
    method: "PATCH",
    body: payload,
  });
  return data.post;
}

export async function submitInvestigationReport(postId, payload) {
  const data = await apiRequest(`/posts/${postId}/investigation/report`, {
    method: "POST",
    body: payload,
  });
  return data.post;
}
