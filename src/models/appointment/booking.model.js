import mongoose from "mongoose";

const bookingAppointmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },
    healthcareCenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HealthCare",
      default: null,
    },
    bookingFor: {
      type: String,
      enum: ["Doctor", "HealthcareCenter"],
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const BookingAppointment = mongoose.model(
  "BookingAppointment",
  bookingAppointmentSchema
);

export default BookingAppointment;
