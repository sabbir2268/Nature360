import { apiRequest } from "../../../lib/api";

export async function verifyComplaint(postId, payload) {
  const data = await apiRequest(`/posts/${postId}/verify`, {
    method: "POST",
    body: payload,
  });
  return data.post;
}

export async function getDuplicateCandidates(postId) {
  const data = await apiRequest(`/posts/${postId}/duplicates`);
  return data.duplicates || [];
}

export async function assignVolunteer(postId, payload) {
  const data = await apiRequest(`/posts/${postId}/assign`, {
    method: "POST",
    body: payload,
  });
  return data.post;
}

export async function addInternalNote(postId, note) {
  const data = await apiRequest(`/posts/${postId}/notes`, {
    method: "POST",
    body: { note },
  });
  return data.post;
}

export async function addCorrectiveAction(postId, payload) {
  const data = await apiRequest(`/posts/${postId}/corrective-actions`, {
    method: "POST",
    body: payload,
  });
  return data.post;
}

export async function updateComplaintStatus(postId, payload) {
  const data = await apiRequest(`/posts/${postId}/status`, {
    method: "PATCH",
    body: payload,
  });
  return data.post;
}

export async function getVolunteers() {
  const data = await apiRequest("/users/volunteers");
  return data.volunteers || [];
}
