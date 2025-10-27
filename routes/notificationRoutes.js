import express from "express";
import mongoose from "mongoose";
import { protect } from "../middleware/authMiddleware.js";
import Notification from "../models/Notification.js";

const router = express.Router();

 

//GET all unread notifications for logged-in user
router.get("/:email", protect, async (req, res) => {
  try {
    const { email } = req.params;
    const notes = await Notification.find({ userEmail: email })
      .sort({ createdAt: -1 })
      .limit(20);

    const formatted = notes.map((n) => ({
      message: n.message,
      type: n.message.includes("accepted") ? "Accepted" : "Rejected",
      date: new Date(n.createdAt).toLocaleString(),
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching notifications:", err);
    res.status(500).json({ message: err.message });
  }
});

//DELETE all notifications for user (on “Clear All”)
router.delete("/:email", protect, async (req, res) => {
  try {
    const { email } = req.params;
    await Notification.deleteMany({ userEmail: email });
    res.json({ message: "✅ Notifications cleared" });
  } catch (err) {
    console.error("❌ Error clearing notifications:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
