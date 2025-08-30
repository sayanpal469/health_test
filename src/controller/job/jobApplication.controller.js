import JobApplication from "../../models/job/jobApplication.model.js";
import Job from "../../models/job/job.model.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import handleMongoErrors from "../../utils/mongooseError.js";

// Apply for Job
export const applyForJob = asyncHandler(async (req, res) => {
  try {
    const {
      jobId,
      firstName,
      lastName,
      resume,
      coverLetter,
      phone,
      email,
      location,
    } = req.body;

    // Validation
    if (
      !jobId ||
      !firstName ||
      !lastName ||
      !resume ||
      !phone ||
      !email ||
      !location
    ) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "All required fields must be filled"));
    }

    // Check if job exists
    const jobExists = await Job.findById(jobId);
    if (!jobExists) {
      return res.status(404).json(new ApiResponse(404, null, "Job not found"));
    }

    // Check if user has already applied for this job
    const existingApplication = await JobApplication.findOne({
      job: jobId,
      email,
    });
    if (existingApplication) {
      return res
        .status(409)
        .json(
          new ApiResponse(409, null, "You have already applied for this job")
        );
    }

    // Create new application
    const application = new JobApplication({
      job: jobId,
      applicant: req.user?._id, // Assuming user is authenticated
      firstName,
      lastName,
      resume,
      coverLetter: coverLetter || null,
      phone,
      email,
      location,
    });

    await application.save();
    await application.populate("job", "title category");

    return res
      .status(201)
      .json(
        new ApiResponse(201, application, "Application submitted successfully")
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get Applications for a Job (Admin only)
export const getJobApplications = asyncHandler(async (req, res) => {
  try {
    const { jobId } = req.params;

    const applications = await JobApplication.find({ job: jobId })
      .populate("job", "title category")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          applications,
          "Applications retrieved successfully"
        )
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get User Applications (Admin only - now gets all applications)
export const getUserApplications = asyncHandler(async (req, res) => {
  try {
    // Removed user restriction - admin can see all applications
    const applications = await JobApplication.find()
      .populate("job", "title category employmentType location")
      .populate("applicant", "firstName lastName email")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          applications,
          "Applications retrieved successfully"
        )
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get Application by ID (Admin only)
export const getApplicationById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const application = await JobApplication.findById(id)
      .populate("job", "title category employmentType location")
      .populate("applicant", "firstName lastName email");

    if (!application) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Application not found"));
    }

    // Removed user authorization check since only admins can access this
    return res
      .status(200)
      .json(
        new ApiResponse(200, application, "Application retrieved successfully")
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Delete Application (Admin only)
export const deleteApplication = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const application = await JobApplication.findById(id);
    if (!application) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Application not found"));
    }

    // Removed user authorization check since only admins can access this
    await JobApplication.findByIdAndDelete(id);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Application deleted successfully"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});
