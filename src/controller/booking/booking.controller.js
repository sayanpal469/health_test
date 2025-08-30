import BookingAppointment from "../../models/appointment/booking.model.js";
import Doctor from "../../models/doctor/doctor.model.js";
import HealthCare from "../../models/health/healthCare.model.js";
import User from "../../models/User/user.model.js";

import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import handleMongoErrors from "../../utils/mongooseError.js";

// Create Booking Appointment (User only)
export const createBooking = asyncHandler(async (req, res) => {
  try {
    const { doctor, healthcareCenter, bookingFor, appointmentDate, reason } =
      req.body;

    const userId = req.user._id;

    // Validation
    if (!bookingFor || !appointmentDate) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            "Booking type and appointment date are required"
          )
        );
    }

    if (bookingFor === "Doctor" && !doctor) {
      return res
        .status(400)
        .json(
          new ApiResponse(400, null, "Doctor is required for doctor booking")
        );
    }

    if (bookingFor === "HealthcareCenter" && !healthcareCenter) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            "Healthcare center is required for healthcare booking"
          )
        );
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    // Check if doctor exists (if booking for doctor)
    if (bookingFor === "Doctor" && doctor) {
      const doctorExists = await Doctor.findById(doctor);
      if (!doctorExists) {
        return res
          .status(404)
          .json(new ApiResponse(404, null, "Doctor not found"));
      }
      if (!doctorExists.isActive) {
        return res
          .status(400)
          .json(new ApiResponse(400, null, "Doctor is not active"));
      }
    }

    // Check if healthcare center exists (if booking for healthcare)
    if (bookingFor === "HealthcareCenter" && healthcareCenter) {
      const healthcareExists = await HealthCare.findById(healthcareCenter);
      if (!healthcareExists) {
        return res
          .status(404)
          .json(new ApiResponse(404, null, "Healthcare center not found"));
      }
      if (!healthcareExists.isActive) {
        return res
          .status(400)
          .json(new ApiResponse(400, null, "Healthcare center is not active"));
      }
    }

    // Check if appointment date is in the future
    if (new Date(appointmentDate) <= new Date()) {
      return res
        .status(400)
        .json(
          new ApiResponse(400, null, "Appointment date must be in the future")
        );
    }

    // Create new booking
    const booking = new BookingAppointment({
      user: userId,
      doctor: bookingFor === "Doctor" ? doctor : null,
      healthcareCenter:
        bookingFor === "HealthcareCenter" ? healthcareCenter : null,
      bookingFor,
      appointmentDate,
      reason,
      status: "Pending",
    });

    await booking.save();

    // Populate the booking with related data
    await booking.populate([
      { path: "user", select: "name email" },
      { path: "doctor", select: "name qualification specialties" },
      { path: "healthcareCenter", select: "name services" },
    ]);

    return res
      .status(201)
      .json(new ApiResponse(201, booking, "Booking created successfully"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get All Bookings (Admin only)
export const getAllBookings = asyncHandler(async (req, res) => {
  try {
    const { status, bookingFor } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (bookingFor) filter.bookingFor = bookingFor;

    const bookings = await BookingAppointment.find(filter)
      .populate([
        { path: "user", select: "name email" },
        { path: "doctor", select: "name qualification" },
        { path: "healthcareCenter", select: "name services" },
      ])
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json(new ApiResponse(200, bookings, "Bookings retrieved successfully"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get All Bookings for Admin (Admin only)
export const getUserBookings = asyncHandler(async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const bookings = await BookingAppointment.find(filter)
      .populate([
        { path: "user", select: "name email" },
        { path: "doctor", select: "name qualification specialties" },
        { path: "healthcareCenter", select: "name services location" },
      ])
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json(new ApiResponse(200, bookings, "Bookings retrieved successfully"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get Booking by ID (Admin only)
export const getBookingById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await BookingAppointment.findById(id).populate([
      { path: "user", select: "name email contactNumber" },
      {
        path: "doctor",
        select: "name qualification specialties contactNumber email",
      },
      {
        path: "healthcareCenter",
        select: "name services location contactNumber",
      },
    ]);

    if (!booking) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Booking not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, booking, "Booking retrieved successfully"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Update Booking Status (Admin only)
export const updateBookingStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (
      !status ||
      !["Pending", "Confirmed", "Completed", "Cancelled"].includes(status)
    ) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Valid status is required"));
    }

    const booking = await BookingAppointment.findById(id);
    if (!booking) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Booking not found"));
    }

    // Update status
    booking.status = status;
    await booking.save();

    await booking.populate([
      { path: "user", select: "name email" },
      { path: "doctor", select: "name qualification" },
      { path: "healthcareCenter", select: "name services" },
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(200, booking, "Booking status updated successfully")
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Cancel Booking (Admin only)
export const cancelBooking = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await BookingAppointment.findById(id);
    if (!booking) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Booking not found"));
    }

    // Check if booking can be cancelled
    if (["Completed", "Cancelled"].includes(booking.status)) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            `Booking is already ${booking.status.toLowerCase()}`
          )
        );
    }

    // Update status to cancelled
    booking.status = "Cancelled";
    await booking.save();

    await booking.populate([
      { path: "user", select: "name email" },
      { path: "doctor", select: "name qualification" },
      { path: "healthcareCenter", select: "name services" },
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, booking, "Booking cancelled successfully"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get Doctor's Appointments (Admin only)
export const getDoctorAppointments = asyncHandler(async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date, status } = req.query;

    const filter = { doctor: doctorId, bookingFor: "Doctor" };
    if (status) filter.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.appointmentDate = { $gte: startDate, $lt: endDate };
    }

    const appointments = await BookingAppointment.find(filter)
      .populate([
        { path: "user", select: "name email contactNumber" },
        { path: "doctor", select: "name qualification" },
      ])
      .sort({ appointmentDate: 1 });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          appointments,
          "Doctor appointments retrieved successfully"
        )
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get Healthcare Center Appointments (Admin only)
export const getHealthcareAppointments = asyncHandler(async (req, res) => {
  try {
    const { healthcareId } = req.params;
    const { date, status } = req.query;

    const filter = {
      healthcareCenter: healthcareId,
      bookingFor: "HealthcareCenter",
    };
    if (status) filter.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.appointmentDate = { $gte: startDate, $lt: endDate };
    }

    const appointments = await BookingAppointment.find(filter)
      .populate([
        { path: "user", select: "name email contactNumber" },
        { path: "healthcareCenter", select: "name services" },
      ])
      .sort({ appointmentDate: 1 });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          appointments,
          "Healthcare center appointments retrieved successfully"
        )
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get Booking Statistics (Admin only)
export const getBookingStats = asyncHandler(async (req, res) => {
  try {
    const stats = await BookingAppointment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalBookings = await BookingAppointment.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookings = await BookingAppointment.countDocuments({
      appointmentDate: { $gte: today, $lt: tomorrow },
    });

    const result = {
      total: totalBookings,
      today: todayBookings,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
    };

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "Booking statistics retrieved successfully"
        )
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});
