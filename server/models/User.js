import mongoose from "mongoose";

export const ROLES = ["Citizen", "Officer", "Volunteer", "Admin"];
export const USER_STATUSES = ["Active", "Suspended"];

const userSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true },
    name: { type: String, default: "", trim: true, maxlength: 80 },
    email: { type: String, default: "", trim: true, lowercase: true, index: true },
    role: { type: String, enum: ROLES, default: "Citizen", index: true },
    status: { type: String, enum: USER_STATUSES, default: "Active", index: true },
    phone: { type: String, default: "", trim: true, maxlength: 30 },
    emailVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

const User = mongoose.model("User", userSchema);

export default User;
