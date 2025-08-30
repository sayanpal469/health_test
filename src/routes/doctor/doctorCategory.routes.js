import express from "express";
import {
  createDoctorCategory,
  getAllDoctorCategories,
  getActiveDoctorCategories,
  getDoctorCategoryById,
  updateDoctorCategory,
  deleteDoctorCategory,
} from "../../controller/doctor/doctorCategory.controller.js";
import { authenticateAdmin } from "../../middleware/admin.auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllDoctorCategories);
router.get("/active", getActiveDoctorCategories);
router.get("/:id", getDoctorCategoryById);

// Protected routes (Admin only)
router.post("/", authenticateAdmin,  createDoctorCategory);
router.put("/:id", authenticateAdmin,  updateDoctorCategory);
router.delete("/:id", authenticateAdmin, deleteDoctorCategory);

export default router;
