import { apiRequest, buildQuery } from "../../../lib/api";

export async function getHotspots(params = {}) {
  return apiRequest(`/intelligence/hotspots${buildQuery(params)}`);
}

export async function getAreas() {
  const data = await apiRequest("/intelligence/areas");
  return data.areas || [];
}

export async function getRiskForComplaint(postId) {
  const data = await apiRequest(`/intelligence/risk/${postId}`);
  return data.risk;
}

export async function getAnalyticsSummary(params = {}) {
  return apiRequest(`/analytics/summary${buildQuery(params)}`);
}

export async function getAnalyticsTrends(params = {}) {
  return apiRequest(`/analytics/trends${buildQuery(params)}`);
}

export async function listAlerts(params = {}) {
  const data = await apiRequest(`/alerts${buildQuery(params)}`);
  return {
    alerts: data.alerts || [],
    pagination: data.pagination,
  };
}

export async function updateAlertStatus(alertId, status) {
  const data = await apiRequest(`/alerts/${alertId}/status`, {
    method: "PATCH",
    body: { status },
  });
  return data.alert;
}

export async function runAlertScan() {
  return apiRequest("/alerts/scan", { method: "POST" });
}
