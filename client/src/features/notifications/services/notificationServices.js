import { apiRequest, buildQuery } from "../../../lib/api";

export async function listNotifications(params = {}) {
  const data = await apiRequest(`/notifications${buildQuery(params)}`);
  return {
    notifications: data.notifications || [],
    unread: data.unread || 0,
    pagination: data.pagination,
  };
}

export async function getUnreadCount() {
  const data = await apiRequest("/notifications/unread-count");
  return data.unread || 0;
}

export async function markNotificationRead(id) {
  const data = await apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
  return data.notification;
}

export async function markAllNotificationsRead() {
  return apiRequest("/notifications/read-all", { method: "POST" });
}
