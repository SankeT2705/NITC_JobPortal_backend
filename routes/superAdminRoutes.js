import express from "express";
import { getRequests, handleRequest, deleteAdmin } from "../controllers/superAdminController.js";
const router = express.Router();

router.get("/requests", getRequests);
router.post("/handle/:id", handleRequest);
router.delete("/delete-admin/:id", deleteAdmin);

export default router;
