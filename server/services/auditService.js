import AuditLog from "../models/AuditLog.js";

/**
 * Records an immutable audit entry. Audit logging must never break the main
 * request, so failures are logged and swallowed.
 */
export async function writeAudit(req, { action, entityType = "", entityId = "", details = {} }) {
  try {
    await AuditLog.create({
      actorUid: req.user?.uid || "",
      actorName: req.user?.name || "",
      actorRole: req.user?.role || "",
      action,
      entityType,
      entityId: entityId ? String(entityId) : "",
      details,
      ip: req.ip || req.socket?.remoteAddress || "",
    });
  } catch (error) {
    console.error("Unable to write audit log:", error.message);
  }
}
