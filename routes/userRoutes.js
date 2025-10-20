// routes/userRoutes.js
import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  addSkill,
  deleteSkill,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.post("/skills", protect, addSkill);
router.delete("/skills/:skill", protect, deleteSkill);

export default router;
