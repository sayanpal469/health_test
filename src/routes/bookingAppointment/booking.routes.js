import express from "express";
import {
  createBooking,
  getAllBookings,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getDoctorAppointments,
  getHealthcareAppointments,
  getBookingStats,
} from "../../controller/booking/booking.controller.js";
import { authenticateUser } from "../../middleware/auth.middleware.js";
import { authenticateAdmin } from "../../middleware/admin.auth.middleware.js";

const router = express.Router();

// User only route - create booking
router.post("/", authenticateUser, createBooking);

// Admin only routes - all other operations
router.get("/", authenticateAdmin, getAllBookings);
router.get("/all-bookings", authenticateAdmin, getUserBookings);
router.get("/:id", authenticateAdmin, getBookingById);
router.put("/:id/status", authenticateAdmin, updateBookingStatus);
router.put("/:id/cancel", authenticateAdmin, cancelBooking);
router.get("/doctor/:doctorId", authenticateAdmin, getDoctorAppointments);
router.get(
  "/healthcare/:healthcareId",
  authenticateAdmin,
  getHealthcareAppointments
);
router.get("/stats/overview", authenticateAdmin, getBookingStats);

export default router;
