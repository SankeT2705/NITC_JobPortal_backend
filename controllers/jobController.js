import Job from "../models/Job.js";
import Application from "../models/Application.js";

/**
 * ✅ Create Job (Admin only)
 */
export const createJob = async (req, res) => {
  try {
    const {
      title,
      department,
      deadline,
      qualifications,
      description,
      requiredSkills,
    } = req.body;

    const ownerEmail = req.user?.email || req.body.owner || "unknown@nitc.com";

    const newJob = await Job.create({
      title,
      department,
      deadline,
      qualifications,
      description,
      requiredSkills: Array.isArray(requiredSkills)
        ? requiredSkills
        : requiredSkills
        ? requiredSkills.split(",").map((s) => s.trim())
        : [],
      owner: ownerEmail,
      applicantCount: 0,
    });

    res.status(201).json({
      message: "✅ Job created successfully",
      job: newJob,
    });
  } catch (err) {
    console.error("❌ Job creation error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * ✅ Get All Jobs (Admin → Own Jobs | User → All Jobs)
 */
export const getJobs = async (req, res) => {
  try {
    let filter = {};
    if (req.user?.role === "admin") filter = { owner: req.user.email };

    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error("❌ Error fetching jobs:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * ✅ Get Jobs by Admin Email (For Dashboard)
 */
export const getAdminJobs = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) return res.status(400).json({ message: "Admin email is required" });

    const jobs = await Job.find({ owner: email }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error("❌ Error fetching admin jobs:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * ✅ Get Single Job by ID
 */
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    console.error("❌ Error fetching job:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * ✅ Update Job
 */
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const requesterEmail = req.user?.email;
    if (job.owner !== requesterEmail)
      return res.status(403).json({ message: "Not authorized to edit this job" });

    const updates = { ...req.body };
    if (req.body.requiredSkills) {
      updates.requiredSkills = Array.isArray(req.body.requiredSkills)
        ? req.body.requiredSkills
        : req.body.requiredSkills.split(",").map((s) => s.trim());
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    res.json({ message: "✅ Job updated successfully", job: updatedJob });
  } catch (err) {
    console.error("❌ Update error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * ✅ Delete Job + Related Applications
 */
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const requesterEmail = req.user?.email;
    if (job.owner !== requesterEmail)
      return res.status(403).json({ message: "Not authorized to delete this job" });

    await Application.deleteMany({ jobId: job._id });
    await job.deleteOne();

    res.json({
      message: "🗑️ Job and related applications deleted successfully",
    });
  } catch (err) {
    console.error("❌ Delete job error:", err);
    res.status(500).json({ message: err.message });
  }
};
