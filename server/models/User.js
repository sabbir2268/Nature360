import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true },
    name: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    role: { type: String, enum: ["Citizen", "Officer"], default: "Citizen" },
  },
  { timestamps: true, versionKey: false },
);

const User = mongoose.model("User", userSchema);

export default User;
