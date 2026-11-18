import mongoose from "mongoose";

export const STATUSES = [
  "Submitted",
  "Under Review",
  "Verified",
  "Investigation",
  "Action Taken",
  "Resolved",
];

export const CATEGORIES = [
  "Illegal Dumping",
  "Water Pollution",
  "Air Pollution",
  "Deforestation",
  "Noise Pollution",
  "Other",
];

export const SEVERITIES = ["Low", "Medium", "High"];

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
    note: { type: String, default: "", trim: true, maxlength: 500 },
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
    data: { type: String, default: "" },
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

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    authorName: { type: String, default: "" },
    authorEmail: { type: String, default: "" },

    title: { type: String, required: true, trim: true, maxlength: 160 },
    category: { type: String, required: true, enum: CATEGORIES },
    severity: { type: String, enum: SEVERITIES, default: "Medium" },
    location: { type: String, default: "", trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },

    status: { type: String, enum: STATUSES, default: "Submitted", index: true },
    statusHistory: { type: [statusHistorySchema], default: [] },

    resolutionStatus: { type: String, enum: RESOLUTION_STATES, default: "Awaiting Citizen" },
    citizenResponses: { type: [citizenResponseSchema], default: [] },
  },
  { timestamps: true, versionKey: false },
);

const Post = mongoose.model("Post", postSchema);

export default Post;
