export function toCoordinate(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function hasCoordinates(point) {
  if (!point) return false;
  return toCoordinate(point.lat) !== null && toCoordinate(point.lng) !== null;
}
