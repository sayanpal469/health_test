import Job from "../../models/job/job.model.js";
import JobCategory from "../../models/job/jobCategory.model.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import handleMongoErrors from "../../utils/mongooseError.js";

// Create Job
export const createJob = asyncHandler(async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      employmentType,
      experienceRequired,
      salaryRange,
      location,
      vacancies,
    } = req.body;

    // Validation
    if (
      !title ||
      !category ||
      !description ||
      !employmentType ||
      !experienceRequired ||
      !salaryRange ||
      !location ||
      !vacancies
    ) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "All required fields must be filled"));
    }

    // Check if category exists
    const categoryExists = await JobCategory.findById(category);
    if (!categoryExists) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Job category not found"));
    }

    // Create new job
    const job = new Job({
      title,
      category,
      description,
      employmentType,
      experienceRequired,
      salaryRange,
      location,
      vacancies,
    });

    await job.save();
    await job.populate("category", "name description");

    return res
      .status(201)
      .json(new ApiResponse(201, job, "Job created successfully"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get All Jobs
export const getAllJobs = asyncHandler(async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("category", "name description")
      .sort({ title: 1 });

    return res
      .status(200)
      .json(new ApiResponse(200, jobs, "Jobs retrieved successfully"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get Job by ID
export const getJobById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id).populate("category", "name description");
    if (!job) {
      return res.status(404).json(new ApiResponse(404, null, "Job not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, job, "Job retrieved successfully"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get Jobs by Category
export const getJobsByCategory = asyncHandler(async (req, res) => {
  try {
    const { categoryId } = req.params;

    const jobs = await Job.find({ category: categoryId })
      .populate("category", "name description")
      .sort({ title: 1 });

    return res
      .status(200)
      .json(
        new ApiResponse(200, jobs, "Jobs by category retrieved successfully")
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Update Job
export const updateJob = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json(new ApiResponse(404, null, "Job not found"));
    }

    // Check if category exists (if being updated)
    if (updateData.category) {
      const categoryExists = await JobCategory.findById(updateData.category);
      if (!categoryExists) {
        return res
          .status(404)
          .json(new ApiResponse(404, null, "Job category not found"));
      }
    }

    // Update job
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        job[key] = updateData[key];
      }
    });

    await job.save();
    await job.populate("category", "name description");

    return res
      .status(200)
      .json(new ApiResponse(200, job, "Job updated successfully"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Delete Job
export const deleteJob = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findByIdAndDelete(id);
    if (!job) {
      return res.status(404).json(new ApiResponse(404, null, "Job not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Job deleted successfully"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Search Jobs
export const searchJobs = asyncHandler(async (req, res) => {
  try {
    const { query, category, location, employmentType } = req.query;

    let searchCriteria = {};

    if (query) {
      searchCriteria.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];
    }

    if (category) {
      searchCriteria.category = category;
    }

    if (location) {
      searchCriteria.location = { $regex: location, $options: "i" };
    }

    if (employmentType) {
      searchCriteria.employmentType = employmentType;
    }

    const jobs = await Job.find(searchCriteria)
      .populate("category", "name description")
      .sort({ title: 1 });

    return res
      .status(200)
      .json(new ApiResponse(200, jobs, "Jobs search results"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});
