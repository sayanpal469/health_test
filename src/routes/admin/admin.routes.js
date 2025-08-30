import express from "express";
import {
  registerAdmin,
  loginAdmin,
  getCurrentAdmin,
  logoutAdmin,
  refreshAdminToken,
  forgotAdminPassword,
  verifyAdminOtp,
  resetAdminPassword,
  resendAdminOtp,
} from "../../controller/admin/adminAuth.controller.js";
import { authenticateAdmin } from "../../middleware/admin.auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/login", loginAdmin);
router.post("/refresh-token", refreshAdminToken);
router.post("/forgot-password", forgotAdminPassword);
router.post("/verify-otp", verifyAdminOtp);
router.post("/reset-password", resetAdminPassword);
router.post("/resend-otp", resendAdminOtp);

// Protected routes (require admin authentication)
router.post("/register", registerAdmin);
router.get("/me", authenticateAdmin, getCurrentAdmin);
router.post("/logout", authenticateAdmin, logoutAdmin);

export default router;
