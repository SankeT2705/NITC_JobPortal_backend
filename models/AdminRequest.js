import mongoose from "mongoose";

const adminRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
}, { timestamps: true });

export default mongoose.model("AdminRequest", adminRequestSchema);
