export const PATHS = {
  HOME: "/",
  ABOUT: "/about",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  CREATE_POST: "/dashboard/create-post",
  TRACK_POST: "/dashboard/track-post",
};

/** Public URL of a single complaint's tracking page. */
export function postDetailsPath(postId) {
  return `${PATHS.TRACK_POST}/${postId}`;
}
