import express from "express";
import {
  createHealthCategory,
  getAllHealthCategories,
  getActiveHealthCategories,
  getHealthCategoryById,
  updateHealthCategory,
  deleteHealthCategory,
} from "../../controller/healthcare/healthCategory.controller.js";

import { authenticateAdmin } from "../../middleware/admin.auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllHealthCategories);
router.get("/active", getActiveHealthCategories);
router.get("/:id", getHealthCategoryById);

// Protected routes (Admin only)
router.post("/", authenticateAdmin, createHealthCategory);
router.put("/:id", authenticateAdmin, updateHealthCategory);
router.delete("/:id", authenticateAdmin, deleteHealthCategory);

export default router;
