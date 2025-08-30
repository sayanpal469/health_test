import express from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
  getJobsByCategory,
  updateJob,
  deleteJob,
  searchJobs,
} from "../../controller/job/job.controller.js";
import { authenticateAdmin } from "../../middleware/admin.auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllJobs);
router.get("/search", searchJobs);
router.get("/category/:categoryId", getJobsByCategory);
router.get("/:id", getJobById);

// Protected routes (Admin only)
router.post("/", authenticateAdmin, createJob);
router.put("/:id", authenticateAdmin, updateJob);
router.delete("/:id", authenticateAdmin, deleteJob);

export default router;
