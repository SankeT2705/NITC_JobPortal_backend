// models/Application.js
import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    applicantEmail: { type: String, required: true },
    applicantName: { type: String },
    coverLetter: { type: String },
    resumeUrl: { type: String },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
    owner: { type: String, required: true }, // Admin email (job owner)
  },
  { timestamps: true }
);

export default mongoose.model("Application", ApplicationSchema);
