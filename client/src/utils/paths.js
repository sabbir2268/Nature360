export const PATHS = {
  HOME: "/",
  ABOUT: "/about",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",

  // Citizen
  CREATE_POST: "/dashboard/create-post",
  TRACK_POST: "/dashboard/track-post",

  // Officer / Admin
  OFFICER_QUEUE: "/dashboard/complaints",

  // Volunteer
  ASSIGNED: "/dashboard/assigned",

  // Shared intelligence
  HOTSPOTS: "/dashboard/hotspots",
  ANALYTICS: "/dashboard/analytics",
  ALERTS: "/dashboard/alerts",
  HOTSPOT_INTELLIGENCE: "/dashboard/hotspot-intelligence",
  NOTIFICATIONS: "/dashboard/notifications",
  SETTINGS: "/dashboard/settings",

  // Admin
  ADMIN_USERS: "/dashboard/admin/users",
  ADMIN_CONFIG: "/dashboard/admin/config",
  ADMIN_AUDIT: "/dashboard/admin/audit",
};

/** Public URL of a single complaint's tracking page. */
export function postDetailsPath(postId) {
  return `${PATHS.TRACK_POST}/${postId}`;
}

export function editPostPath(postId) {
  return `${PATHS.CREATE_POST}/${postId}/edit`;
}

export function officerComplaintPath(postId) {
  return `${PATHS.OFFICER_QUEUE}/${postId}`;
}

export function assignedCasePath(postId) {
  return `${PATHS.ASSIGNED}/${postId}`;
}
