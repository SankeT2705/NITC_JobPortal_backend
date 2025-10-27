import AdminRequest from "../models/AdminRequest.js";
import User from "../models/User.js";
import nodemailer from "nodemailer";

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER, // Add in .env
    pass: process.env.SMTP_PASS,
  },
});

// Fetch all admin requests
export const getRequests = async (req, res) => {
  try {
    const requests = await AdminRequest.find().sort({ createdAt: -1 });
    const admins = await User.find({ role: "admin" });
    res.json({ requests, admins });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Handle accept/reject
export const handleRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const request = await AdminRequest.findById(id);

    if (!request) return res.status(404).json({ message: "Request not found" });

    if (action === "accept") {
      // Generate random password
      const randomPass = Math.random().toString(36).slice(-8);

      // Create admin user
      const newAdmin = new User({
        name: request.name,
        email: request.email,
        password: randomPass,
        department: request.department,
        role: "admin",
      });
      await newAdmin.save();

      // Send email with password
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: request.email,
        subject: "Admin Access Granted - NITC Job Portal",
        text: `Hello ${request.name},\n\nYour admin request has been approved.\nLogin using the password: ${randomPass}\n\nBest,\nNITC Team`,
      });

      request.status = "Accepted";
      await request.save();
      return res.json({ message: "Admin request approved & email sent." });
    }

    if (action === "reject") {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: request.email,
        subject: "Admin Request Rejected - NITC Job Portal",
        text: `Hello ${request.name},\n\nWe regret to inform you that your admin request has been rejected.\n\nRegards,\nNITC Team`,
      });

      request.status = "Rejected";
      await request.save();
      return res.json({ message: "Admin request rejected & email sent." });
    }

    res.status(400).json({ message: "Invalid action" });
  } catch (err) {
    console.error("❌ Error in handleRequest:", err);
    res.status(500).json({ message: err.message });
  }
};

// Delete admin
 

export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Find admin first
    const admin = await User.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Delete the user record
    await User.findByIdAndDelete(id);

    // Also delete any admin request linked to the same email
    await AdminRequest.deleteOne({ email: admin.email });

    res.json({ message: `✅ Admin '${admin.email}' deleted successfully.` });
  } catch (err) {
    console.error("❌ Error deleting admin:", err);
    res.status(500).json({ message: "Server error while deleting admin" });
  }
};

