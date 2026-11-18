import mongoose from "mongoose";

export const ALERT_STATES = ["Active", "Acknowledged", "Resolved"];

const alertSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true, index: true },
    area: { type: String, required: true, trim: true, index: true },
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    reportCount: { type: Number, default: 0 },
    windowDays: { type: Number, default: 7 },
    riskScore: { type: Number, default: 0 },
    riskLevel: { type: String, default: "High" },
    message: { type: String, default: "", trim: true, maxlength: 800 },
    status: { type: String, enum: ALERT_STATES, default: "Active", index: true },
    acknowledgedBy: {
      uid: { type: String, default: "" },
      name: { type: String, default: "" },
      role: { type: String, default: "" },
    },
    acknowledgedAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

alertSchema.index({ status: 1, createdAt: -1 });

const Alert = mongoose.model("Alert", alertSchema);

export default Alert;
