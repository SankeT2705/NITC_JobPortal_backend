import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },
    // ✅ Add status type for better UI filtering (e.g. Accepted / Rejected)
    type: {
      type: String,
      enum: ["Accepted", "Rejected", "Info"],
      default: "Info",
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },

    // ✅ Add a formatted date for frontend display
    date: {
      type: String,
      default: () => new Date().toLocaleString(),
    },
  },
  { timestamps: true }
);

// ✅ Prevent “Cannot overwrite model” error
const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default Notification;
