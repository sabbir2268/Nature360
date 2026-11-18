import { apiDownload, apiRequest, buildQuery } from "../../../lib/api";

export async function listUsers(params = {}) {
  const data = await apiRequest(`/users${buildQuery(params)}`);
  return {
    users: data.users || [],
    pagination: data.pagination,
  };
}

export async function updateUserRole(userId, role) {
  const data = await apiRequest(`/users/${userId}/role`, {
    method: "PATCH",
    body: { role },
  });
  return data.user;
}

export async function updateUserStatus(userId, status) {
  const data = await apiRequest(`/users/${userId}/status`, {
    method: "PATCH",
    body: { status },
  });
  return data.user;
}

export async function listAuditLogs(params = {}) {
  const data = await apiRequest(`/audit${buildQuery(params)}`);
  return {
    logs: data.logs || [],
    pagination: data.pagination,
  };
}

export async function downloadAdminReport() {
  const filename = `nature360-admin-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  await apiDownload("/reports/admin.pdf", filename);
}
