import express from "express";
import {
  createHealthcareCenter,
  getAllHealthcareCenters,
  getActiveHealthcareCenters,
  getHealthcareCenterById,
  getHealthcareCentersByCategory,
  updateHealthcareCenter,
  deleteHealthcareCenter,
  searchHealthcareCenters,
  getHealthcareCentersByPincode,
} from "../../controller/healthcare/healthCare.controller.js";
import { authenticateAdmin } from "../../middleware/admin.auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllHealthcareCenters);
router.get("/active", getActiveHealthcareCenters);
router.get("/search", searchHealthcareCenters);
router.get("/category/:categoryId", getHealthcareCentersByCategory);
router.get("/pincode/:pincode", getHealthcareCentersByPincode);
router.get("/:id", getHealthcareCenterById);

// Protected routes (Admin only)
router.post("/", authenticateAdmin, createHealthcareCenter);
router.put("/:id", authenticateAdmin, updateHealthcareCenter);
router.delete("/:id", authenticateAdmin, deleteHealthcareCenter);

export default router;
