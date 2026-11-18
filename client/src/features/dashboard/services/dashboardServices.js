import { apiRequest } from "../../../lib/api";

export async function getDashboardOverview() {
  return apiRequest("/dashboard/overview");
}
