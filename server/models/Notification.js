import mongoose from "mongoose";

export const NOTIFICATION_TYPES = [
  "assignment",
  "status",
  "verification",
  "investigation",
  "alert",
  "resolution",
  "system",
];

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: NOTIFICATION_TYPES, default: "system", index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    message: { type: String, default: "", trim: true, maxlength: 800 },
    link: { type: String, default: "", trim: true, maxlength: 300 },
    relatedPost: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
    read: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
