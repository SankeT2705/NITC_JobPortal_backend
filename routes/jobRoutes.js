import express from "express";
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getAdminJobs, // ✅ must import
} from "../controllers/jobController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Order matters — keep before :id
router.get("/admin/:email", getAdminJobs);

// ✅ Standard job routes
router.post("/", protect, createJob);
router.get("/", getJobs);
router.get("/:id", protect, getJobById);
router.put("/:id", protect, updateJob);
router.delete("/:id", protect, deleteJob);

export default router;
