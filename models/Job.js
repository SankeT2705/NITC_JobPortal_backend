// models/Job.js
import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    department: { type: String, required: true },
    deadline: { type: String, required: true },
    qualifications: { type: String },
    description: { type: String },
    requiredSkills: [{ type: String }],
    owner: { type: String, required: true }, // Admin email
    applicantCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Job", JobSchema);
