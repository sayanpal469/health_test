import express from "express";
import {
  createCourseCategory,
  getAllCourseCategories,
  getCourseCategoryById,
  updateCourseCategory,
  deleteCourseCategory,
  toggleCategoryStatus,
  getActiveCourseCategories,
} from "../../controller/course/courseCategory.controller.js";
import { authenticateAdmin } from "../../middleware/admin.auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllCourseCategories);
router.get("/active", getActiveCourseCategories);
router.get("/:id", getCourseCategoryById);

// Admin only routes
router.post("/", authenticateAdmin, createCourseCategory);
router.put("/:id", authenticateAdmin, updateCourseCategory);
router.delete("/:id", authenticateAdmin, deleteCourseCategory);
router.patch("/:id/toggle-status", authenticateAdmin, toggleCategoryStatus);

export default router;
