import DoctorCategory from "../../models/doctor/doctorCategory.model.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import handleMongoErrors from "../../utils/mongooseError.js";

// Create Doctor Category
export const createDoctorCategory = asyncHandler(async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    // Validation
    if (!name) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Category name is required"));
    }

    // Check if category already exists
    const existingCategory = await DoctorCategory.findOne({ name });
    if (existingCategory) {
      return res
        .status(409)
        .json(new ApiResponse(409, null, "Category already exists"));
    }

    // Create new category
    const category = new DoctorCategory({
      name,
      description,
      isActive: isActive || false,
    });

    await category.save();

    return res
      .status(201)
      .json(
        new ApiResponse(201, category, "Doctor category created successfully")
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get All Doctor Categories
export const getAllDoctorCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await DoctorCategory.find().sort({ name: 1 });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          categories,
          "Doctor categories retrieved successfully"
        )
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get Active Doctor Categories
export const getActiveDoctorCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await DoctorCategory.find({ isActive: true }).sort({
      name: 1,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          categories,
          "Active doctor categories retrieved successfully"
        )
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get Doctor Category by ID
export const getDoctorCategoryById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const category = await DoctorCategory.findById(id);
    if (!category) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Doctor category not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, category, "Doctor category retrieved successfully")
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Update Doctor Category
export const updateDoctorCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const category = await DoctorCategory.findById(id);
    if (!category) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Doctor category not found"));
    }

    // Check if name already exists (excluding current category)
    if (name && name !== category.name) {
      const existingCategory = await DoctorCategory.findOne({ name });
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
        new ApiResponse(200, category, "Doctor category updated successfully")
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Delete Doctor Category
export const deleteDoctorCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const category = await DoctorCategory.findByIdAndDelete(id);
    if (!category) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Doctor category not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, null, "Doctor category deleted successfully")
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});
