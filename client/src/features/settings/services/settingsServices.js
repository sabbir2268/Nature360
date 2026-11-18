import { apiRequest } from "../../../lib/api";

export async function getPublicSettings() {
  const data = await apiRequest("/settings/public");
  return data.settings;
}

export async function getAdminSettings() {
  const data = await apiRequest("/settings");
  return data.settings;
}

export async function updateAdminSettings(payload) {
  const data = await apiRequest("/settings", { method: "PUT", body: payload });
  return data.settings;
}
