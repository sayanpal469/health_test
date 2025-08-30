import express from "express";
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  toggleCourseStatus,
} from "../../controller/course/course.controller.js";
import { authenticateAdmin } from "../../middleware/admin.auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllCourses);
router.get("/:id", getCourseById);

// Admin only routes
router.post("/", authenticateAdmin, createCourse);
router.put("/:id", authenticateAdmin, updateCourse);
router.delete("/:id", authenticateAdmin, deleteCourse);
router.patch("/:id/toggle-status", authenticateAdmin, toggleCourseStatus);

export default router;
