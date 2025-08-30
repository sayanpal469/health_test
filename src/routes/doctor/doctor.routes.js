import express from "express";
import {
  createDoctor,
  getAllDoctors,
  getActiveDoctors,
  getDoctorById,
  getDoctorsByCategory,
  updateDoctor,
  deleteDoctor,
  searchDoctors,
} from "../../controller/doctor/doctor.controller.js";
import { authenticateAdmin } from "../../middleware/admin.auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllDoctors);
router.get("/active", getActiveDoctors);
router.get("/search", searchDoctors);
router.get("/category/:categoryId", getDoctorsByCategory);
router.get("/:id", getDoctorById);

// Protected routes (Admin only)
router.post("/", authenticateAdmin, createDoctor);
router.put("/:id", authenticateAdmin, updateDoctor);
router.delete("/:id", authenticateAdmin, deleteDoctor);

export default router;
