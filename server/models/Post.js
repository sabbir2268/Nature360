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
  },
  { timestamps: true, versionKey: false },
);

const Post = mongoose.model("Post", postSchema);

export default Post;
