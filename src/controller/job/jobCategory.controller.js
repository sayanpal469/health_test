import JobCategory from "../../models/job/jobCategory.model.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import handleMongoErrors from "../../utils/mongooseError.js";

// Create Job Category
export const createJobCategory = asyncHandler(async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    // Validation
    if (!name) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Category name is required"));
    }

    // Check if category already exists
    const existingCategory = await JobCategory.findOne({ name });
    if (existingCategory) {
      return res
        .status(409)
        .json(new ApiResponse(409, null, "Category already exists"));
    }

    // Create new category
    const category = new JobCategory({
      name,
      description,
      isActive: isActive || false,
    });

    await category.save();

    return res
      .status(201)
      .json(
        new ApiResponse(201, category, "Job category created successfully")
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get All Job Categories
export const getAllJobCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await JobCategory.find().sort({ name: 1 });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          categories,
          "Job categories retrieved successfully"
        )
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get Active Job Categories
export const getActiveJobCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await JobCategory.find({ isActive: true }).sort({
      name: 1,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          categories,
          "Active job categories retrieved successfully"
        )
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get Job Category by ID
export const getJobCategoryById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const category = await JobCategory.findById(id);
    if (!category) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Job category not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, category, "Job category retrieved successfully")
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Update Job Category
export const updateJobCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const category = await JobCategory.findById(id);
    if (!category) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Job category not found"));
    }

    // Check if name already exists (excluding current category)
    if (name && name !== category.name) {
      const existingCategory = await JobCategory.findOne({ name });
      if (existingCategory) {
        return res
          .status(409)
          .json(new ApiResponse(409, null, "Category name already exists"));
      }
    }

    // Update fields
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    return res
      .status(200)
      .json(
        new ApiResponse(200, category, "Job category updated successfully")
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Delete Job Category
export const deleteJobCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const category = await JobCategory.findByIdAndDelete(id);
    if (!category) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Job category not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Job category deleted successfully"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});
