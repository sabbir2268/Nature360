export function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

export function escapeRegex(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parsePagination(query, { defaultLimit = 20, maxLimit = 100 } = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number.parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

export function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function normalizeCoordinates(input) {
  if (!input || typeof input !== "object") return { lat: null, lng: null };

  const lat = toNumber(input.lat);
  const lng = toNumber(input.lng);

  if (lat === null || lng === null) return { lat: null, lng: null };
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return { error: "Coordinates are outside the valid latitude/longitude range." };
  }

  return { lat, lng };
}

export function actorFromUser(user) {
  return {
    uid: user.uid,
    name: user.name,
    role: user.role,
  };
}

/** Keep URLs private-ish but avoid accepting arbitrary third-party links. */
export function isValidEvidenceUrl(url) {
  if (!url) return false;
  if (url.startsWith("data:")) return true;
  return (
    url.startsWith("https://firebasestorage.googleapis.com/") ||
    url.startsWith("https://storage.googleapis.com/")
  );
}

export function paginationMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
