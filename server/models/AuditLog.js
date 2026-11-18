import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actorUid: { type: String, default: "", index: true },
    actorName: { type: String, default: "" },
    actorRole: { type: String, default: "" },
    action: { type: String, required: true, trim: true, maxlength: 80, index: true },
    entityType: { type: String, default: "", trim: true, maxlength: 60, index: true },
    entityId: { type: String, default: "", index: true },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String, default: "" },
  },
  { timestamps: true, versionKey: false },
);

auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
