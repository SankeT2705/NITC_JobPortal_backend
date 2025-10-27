import express from "express";
import {
  applyForJob,
  getUserApplications,
  getAdminApplications,
  updateApplicationStatus,
} from "../controllers/applicationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

//Admin-specific stats
router.get("/admin/:email", getAdminApplications);

//User-specific routes
router.post("/apply", protect, applyForJob);
router.get("/user", protect, getUserApplications);
router.put("/:id/status", protect, updateApplicationStatus);

export default router;
