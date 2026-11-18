import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, default: "", trim: true, maxlength: 240 },
    active: { type: Boolean, default: true },
  },
  { _id: false },
);

const severitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 40 },
    weight: { type: Number, default: 2, min: 0, max: 10 },
    color: { type: String, default: "amber", trim: true, maxlength: 30 },
    active: { type: Boolean, default: true },
  },
  { _id: false },
);

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "global" },
    categories: { type: [categorySchema], default: [] },
    severityLevels: { type: [severitySchema], default: [] },
    riskRules: {
      frequencyWeight: { type: Number, default: 30, min: 0, max: 100 },
      severityWeight: { type: Number, default: 25, min: 0, max: 100 },
      recurrenceWeight: { type: Number, default: 25, min: 0, max: 100 },
      recencyWeight: { type: Number, default: 20, min: 0, max: 100 },
      frequencyWindowDays: { type: Number, default: 30, min: 1, max: 365 },
      recurrenceWindowDays: { type: Number, default: 90, min: 1, max: 365 },
      lowMax: { type: Number, default: 39, min: 0, max: 100 },
      moderateMax: { type: Number, default: 59, min: 0, max: 100 },
      highMax: { type: Number, default: 79, min: 0, max: 100 },
    },
    alertRules: {
      active: { type: Boolean, default: true },
      reportThreshold: { type: Number, default: 10, min: 1, max: 1000 },
      windowDays: { type: Number, default: 7, min: 1, max: 365 },
      notifyRoles: { type: [String], default: ["Officer", "Admin"] },
    },
  },
  { timestamps: true, versionKey: false },
);

const Setting = mongoose.model("Setting", settingSchema);

export default Setting;
