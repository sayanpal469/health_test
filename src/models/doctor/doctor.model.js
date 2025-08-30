import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DoctorCategory",
  },
  healthcareCenters: [
    {
      type: String,
      required: true,
    },
  ],
  qualification: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
  },
  specialties: [
    {
      type: String,
      required: true,
    },
  ],
  services: [
    {
      type: String,
      required: true,
    },
  ],
  contactNumber: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  availableDays: [
    {
      type: String,
      enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
  ],
  availableTime: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
