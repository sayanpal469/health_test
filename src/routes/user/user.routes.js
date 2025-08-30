import express from "express";
import {
  registerUser,
  verifyOtp,
  resendOtp,
  loginUser,
  getCurrentUser,
  logoutUser,
  refreshToken,
  forgotPassword,
  resetPassword,
} from "../../controller/user/userAuth.controller.js";
import { authenticateUser } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", loginUser);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes
router.get("/me", authenticateUser, getCurrentUser);
router.post("/logout", authenticateUser, logoutUser);

export default router;
