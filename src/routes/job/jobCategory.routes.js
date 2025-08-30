import express from "express";
import {
  createJobCategory,
  getAllJobCategories,
  getActiveJobCategories,
  getJobCategoryById,
  updateJobCategory,
  deleteJobCategory,
} from "../../controller/job/jobCategory.controller.js";
import { authenticateAdmin } from "../../middleware/admin.auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllJobCategories);
router.get("/active", getActiveJobCategories);
router.get("/:id", getJobCategoryById);

// Protected routes (Admin only)
router.post("/", authenticateAdmin, createJobCategory);
router.put("/:id", authenticateAdmin, updateJobCategory);
router.delete("/:id", authenticateAdmin, deleteJobCategory);

export default router;
