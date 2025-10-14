import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ✅ Prevent “Cannot overwrite model” error
const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default Notification;
