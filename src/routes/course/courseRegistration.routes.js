import express from "express";
import {
  createCourseRegistration,
  getAllCourseRegistrations,
  getCourseRegistrationById,
  getUserCourseRegistrations,
  updateCourseRegistration,
  deleteCourseRegistration,
  getRegistrationsByCourseId,
} from "../../controller/course/courseRegistration.controller.js";
import { authenticateUser } from "../../middleware/auth.middleware.js";
import { authenticateAdmin } from "../../middleware/admin.auth.middleware.js";


const router = express.Router();

// User routes (authenticated users)
router.post("/", authenticateUser, createCourseRegistration);
router.get("/my-registrations", authenticateUser, getUserCourseRegistrations);
router.get("/:id", authenticateUser, getCourseRegistrationById);

// Admin only routes
router.get("/", authenticateAdmin, getAllCourseRegistrations);
router.get("/course/:courseId", authenticateAdmin, getRegistrationsByCourseId);
router.put("/:id", authenticateAdmin, updateCourseRegistration);
router.delete("/:id", authenticateAdmin, deleteCourseRegistration);

export default router;
