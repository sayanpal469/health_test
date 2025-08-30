import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobCategory",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    employmentType: {
      type: String,
      enum: ["Full-Time", "Part-Time", "Contract", "Internship"],
      required: true,
    },
    experienceRequired: {
      type: Number,
      required: true,
    },
    salaryRange: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    vacancies: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model("Job", jobSchema);

export default Job;
