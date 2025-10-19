import mongoose from "mongoose";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { sendEmail } from "../config/emailService.js";
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

    const application = await Application.findById(id).populate("jobId");
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // ✅ Update status
    application.status = status;
    await application.save();

    // ✅ Get applicant details
    const applicantEmail = application.applicantEmail || application.applicant;
    const applicant = await User.findOne({ email: applicantEmail });

    if (applicant) {
      // ---------- (1) EMAIL NOTIFICATION ----------
      let subject = "";
      let messageHtml = "";
      let messageText = "";

      if (status === "Accepted") {
        subject = `🎉 Congratulations! Your Application Has Been Accepted`;
        messageText = `Dear ${applicant.name}, your application for ${application.jobId?.title || "the posted role"} has been accepted.`;
        messageHtml = `
          <p>Dear ${applicant.name},</p>
          <p>We’re pleased to inform you that your application for 
          <strong>${application.jobId?.title || "the posted role"}</strong> 
          has been <strong>Accepted</strong>.</p>
          <p>Our team will contact you soon.</p>
          <p>Best regards,<br/>NITC Job Portal Team</p>
        `;
      } else if (status === "Rejected") {
        subject = `⚠️ Update: Your Application Status`;
        messageText = `Dear ${applicant.name}, unfortunately, your application for ${application.jobId?.title} was not selected this time.`;
        messageHtml = `
          <p>Dear ${applicant.name},</p>
          <p>We appreciate your interest in 
          <strong>${application.jobId?.title || "the posted role"}</strong>.</p>
          <p>Unfortunately, your application has been <strong>Rejected</strong>.</p>
          <p>We encourage you to apply for other roles that match your skills.</p>
          <p>Best wishes,<br/>NITC Job Portal Team</p>
        `;
      }

      await sendEmail(applicant.email, subject, messageHtml);

      // ---------- (2) IN-APP NOTIFICATION ----------
      await Notification.create({
        userEmail: applicant.email,
        type: status,
        message: messageText,
      });

      console.log(`📩 ${status} notification sent to ${applicant.email}`);
    }

    res.json({ message: `✅ Application status updated to '${status}' and user notified.` });
  } catch (err) {
    console.error("❌ Error updating status:", err);
    res.status(500).json({ message: "Server error while updating status" });
  }
};