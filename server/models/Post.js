import mongoose from "mongoose";

export const STATUSES = [
  "Submitted",
  "Under Review",
  "Verified",
  "Investigation",
  "Action Taken",
  "Resolved",
  "Rejected",
];

/** Active workflow statuses shown in the progress timeline. */
export const WORKFLOW_STATUSES = STATUSES.filter((status) => status !== "Rejected");

export const DEFAULT_CATEGORIES = [
  "Illegal Dumping",
  "Water Pollution",
  "Air Pollution",
  "Deforestation",
  "Noise Pollution",
  "Other",
];

export const DEFAULT_SEVERITIES = ["Low", "Medium", "High", "Critical"];
export const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
export const VERIFICATION_STATES = ["Pending", "Verified", "Rejected"];
export const INVESTIGATION_STATES = ["Pending", "In Progress", "Submitted", "Completed"];

export const RESOLUTION_ACTIONS = [
  "Confirmed",
  "Feedback",
  "Additional Evidence",
  "Reopened",
  "Incorrect Resolution",
];

export const RESOLUTION_STATES = ["Awaiting Citizen", "Confirmed", "Reopened", "Disputed"];

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATUSES, required: true },
    note: { type: String, default: "", trim: true, maxlength: 800 },
    changedAt: { type: Date, default: Date.now },
    changedBy: {
      uid: { type: String, default: "" },
      name: { type: String, default: "" },
      role: { type: String, default: "Citizen" },
    },
  },
  { _id: false },
);

const evidenceSchema = new mongoose.Schema(
  {
    name: { type: String, default: "", trim: true, maxlength: 200 },
    mimeType: { type: String, default: "", trim: true },
    size: { type: Number, default: 0 },
    /** Firebase Storage download URL (preferred). */
    url: { type: String, default: "", trim: true },
    /** Firebase Storage object path so the file can be removed if needed. */
    path: { type: String, default: "", trim: true },
    /** Legacy base64 data URL used by earlier complaint responses. */
    data: { type: String, default: "" },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const citizenResponseSchema = new mongoose.Schema(
  {
    action: { type: String, enum: RESOLUTION_ACTIONS, required: true },
    message: { type: String, default: "", trim: true, maxlength: 1000 },
    evidence: { type: evidenceSchema, default: null },
    respondedAt: { type: Date, default: Date.now },
    respondedBy: {
      uid: { type: String, default: "" },
      name: { type: String, default: "" },
      role: { type: String, default: "Citizen" },
    },
  },
  { _id: false },
);

const internalNoteSchema = new mongoose.Schema(
  {
    note: { type: String, required: true, trim: true, maxlength: 1500 },
    addedAt: { type: Date, default: Date.now },
    addedBy: {
      uid: { type: String, default: "" },
      name: { type: String, default: "" },
      role: { type: String, default: "Officer" },
    },
  },
  { _id: false },
);

const correctiveActionSchema = new mongoose.Schema(
  {
    action: { type: String, required: true, trim: true, maxlength: 300 },
    note: { type: String, default: "", trim: true, maxlength: 1000 },
    performedAt: { type: Date, default: Date.now },
    performedBy: {
      uid: { type: String, default: "" },
      name: { type: String, default: "" },
      role: { type: String, default: "Officer" },
    },
  },
  { _id: false },
);

const investigationSchema = new mongoose.Schema(
  {
    status: { type: String, enum: INVESTIGATION_STATES, default: "Pending" },
    observations: { type: String, default: "", trim: true, maxlength: 4000 },
    gps: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      accuracy: { type: Number, default: null },
    },
    evidence: { type: [evidenceSchema], default: [] },
    report: { type: String, default: "", trim: true, maxlength: 6000 },
    startedAt: { type: Date, default: null },
    submittedAt: { type: Date, default: null },
    submittedBy: {
      uid: { type: String, default: "" },
      name: { type: String, default: "" },
      role: { type: String, default: "Volunteer" },
    },
  },
  { _id: false },
);

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    authorName: { type: String, default: "" },
    authorEmail: { type: String, default: "" },

    title: { type: String, required: true, trim: true, maxlength: 160 },
    category: { type: String, required: true, trim: true, maxlength: 80, index: true },
    severity: { type: String, default: "Medium", trim: true, index: true },
    priority: { type: String, enum: PRIORITIES, default: "Medium", index: true },
    location: { type: String, default: "", trim: true, maxlength: 300 },
    area: { type: String, default: "", trim: true, maxlength: 120, index: true },
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    incidentAt: { type: Date, default: null },
    evidence: { type: [evidenceSchema], default: [] },

    status: { type: String, enum: STATUSES, default: "Submitted", index: true },
    statusHistory: { type: [statusHistorySchema], default: [] },

    verificationStatus: {
      type: String,
      enum: VERIFICATION_STATES,
      default: "Pending",
      index: true,
    },
    rejectionReason: { type: String, default: "", trim: true, maxlength: 500 },

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    assignedBy: {
      uid: { type: String, default: "" },
      name: { type: String, default: "" },
      role: { type: String, default: "" },
    },
    assignedAt: { type: Date, default: null },
    deadline: { type: Date, default: null, index: true },

    internalNotes: { type: [internalNoteSchema], default: [] },
    correctiveActions: { type: [correctiveActionSchema], default: [] },
    investigation: { type: investigationSchema, default: () => ({}) },

    duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    riskLevel: { type: String, default: "Low", index: true },

    resolutionStatus: { type: String, enum: RESOLUTION_STATES, default: "Awaiting Citizen" },
    citizenResponses: { type: [citizenResponseSchema], default: [] },

    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: {
      uid: { type: String, default: "" },
      name: { type: String, default: "" },
      role: { type: String, default: "" },
    },
  },
  { timestamps: true, versionKey: false },
);

postSchema.index({ category: 1, area: 1, createdAt: -1 });
postSchema.index({ isDeleted: 1, status: 1, createdAt: -1 });

const Post = mongoose.model("Post", postSchema);

export default Post;
