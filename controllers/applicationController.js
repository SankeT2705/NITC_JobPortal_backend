import mongoose from "mongoose";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import Notification from "../models/Notification.js";

/**
 * ✅ Apply for a Job (User)
 */
export const applyForJob = async (req, res) => {
  try {
    const { jobId, coverLetter, resumeUrl } = req.body;
    const applicantEmail = req.user?.email;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const existing = await Application.findOne({ jobId, applicantEmail });
    if (existing)
      return res
        .status(400)
        .json({ message: "You have already applied for this job." });

    const newApp = await Application.create({
      jobId,
      applicantEmail,
      applicantName: req.user?.name,
      coverLetter,
      resumeUrl,
      owner: job.owner,
    });

    job.applicantCount = await Application.countDocuments({ jobId });
    await job.save();

    res.status(201).json({
      message: "✅ Application submitted successfully.",
      application: newApp,
    });
  } catch (err) {
    console.error("❌ Error in applyForJob:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * ✅ Get all applications for logged-in user
 */
export const getUserApplications = async (req, res) => {
  try {
    const userEmail = req.user?.email;
    const applications = await Application.find({ applicantEmail: userEmail })
      .populate("jobId", "title department deadline")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error("❌ Error fetching user applications:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * ✅ Get all applications for Admin (by email)
 */
export const getAdminApplications = async (req, res) => {
  try {
    const adminEmail = req.params.email || req.user?.email;
    if (!adminEmail)
      return res.status(400).json({ message: "Admin email required" });

    const apps = await Application.find({ owner: adminEmail })
      .populate("jobId", "title department deadline")
      .sort({ createdAt: -1 });

    const formattedApps = apps.map((app) => ({
      _id: app._id,
      job: {
        title: app.jobId?.title,
        department: app.jobId?.department,
        deadline: app.jobId?.deadline,
      },
      applicant: {
        name: app.applicantName || "Unknown",
        email: app.applicantEmail || "Not provided",
      },
      coverLetter: app.coverLetter || "",
      resumeUrl: app.resumeUrl || "",
      appliedOn: app.createdAt,
      status: app.status || "Pending",
    }));

    res.json(formattedApps);
  } catch (err) {
    console.error("❌ Error fetching admin applications:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * ✅ Update application status (Admin only)
 */
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminEmail = req.user?.email;

    const application = await Application.findById(id).populate("jobId");
    if (!application)
      return res.status(404).json({ message: "Application not found" });

    const job = await Job.findById(application.jobId._id);
    if (!job || job.owner !== adminEmail)
      return res
        .status(403)
        .json({ message: "Not authorized to update this application" });

    if (!["Accepted", "Rejected"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    application.status = status;
    await application.save();

    // ✅ Create backend notification safely
    await Notification.create({
      userEmail: application.applicantEmail,
      message: `Your application for "${job.title}" was ${status.toLowerCase()}.`,
    });

    res.json({
      message: `✅ Application marked as ${status}`,
      application,
    });
  } catch (err) {
    console.error("❌ Error updating application status:", err);
    res.status(500).json({ message: err.message });
  }
};
