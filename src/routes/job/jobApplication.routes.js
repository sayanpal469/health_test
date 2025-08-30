import express from "express";
import {
  applyForJob,
  getJobApplications,
  getUserApplications,
  getApplicationById,
  deleteApplication,
} from "../../controller/job/jobApplication.controller.js";

import { authenticateAdmin } from "../../middleware/admin.auth.middleware.js";
import { authenticateUser } from "../../middleware/auth.middleware.js";

const router = express.Router();

// User only route - apply for job
router.post("/apply", authenticateUser, applyForJob);

// Admin only routes - all other operations
router.get("/job/:jobId", authenticateAdmin, getJobApplications);
router.get("/my-applications", authenticateAdmin, getUserApplications);
router.get("/:id", authenticateAdmin, getApplicationById);
router.delete("/:id", authenticateAdmin, deleteApplication);

export default router;
