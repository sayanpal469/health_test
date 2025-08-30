import CourseCategory from "../../models/course/courseCategory.model.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import handleMongoErrors from "../../utils/mongooseError.js";

// Create Course Category (Admin only)
export const createCourseCategory = asyncHandler(async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    // Validation
    if (!name) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Category name is required"));
    }

    // Check if category already exists
    const existingCategory = await CourseCategory.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existingCategory) {
      return res
        .status(409)
        .json(new ApiResponse(409, null, "Category already exists"));
    }

    // Create new category
    const category = new CourseCategory({
      name,
      description,
      isActive: isActive || false,
    });

    await category.save();

    return res
      .status(201)
      .json(new ApiResponse(201, category, "Category created successfully"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get All Course Categories
export const getAllCourseCategories = asyncHandler(async (req, res) => {
  try {
    const { isActive } = req.query;

    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const categories = await CourseCategory.find(filter).sort({ name: 1 });

    return res
      .status(200)
      .json(
        new ApiResponse(200, categories, "Categories retrieved successfully")
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get Active Course Categories
export const getActiveCourseCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await CourseCategory.find({ isActive: true }).sort({
      name: 1,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          categories,
          "Active categories retrieved successfully"
        )
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get Course Category by ID
export const getCourseCategoryById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const category = await CourseCategory.findById(id);

    if (!category) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Category not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, category, "Category retrieved successfully"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Update Course Category (Admin only)
export const updateCourseCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const category = await CourseCategory.findById(id);
    if (!category) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Category not found"));
    }

    // Check if new name already exists (excluding current category)
    if (name && name !== category.name) {
      const existingCategory = await CourseCategory.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: id },
      });
      if (existingCategory) {
        return res
          .status(409)
          .json(new ApiResponse(409, null, "Category name already exists"));
      }
    }

    // Update fields
    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    return res
      .status(200)
      .json(new ApiResponse(200, category, "Category updated successfully"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Delete Course Category (Admin only)
export const deleteCourseCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const category = await CourseCategory.findById(id);
    if (!category) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Category not found"));
    }

    await CourseCategory.findByIdAndDelete(id);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Category deleted successfully"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Toggle Category Status (Admin only)
export const toggleCategoryStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const category = await CourseCategory.findById(id);
    if (!category) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Category not found"));
    }

    category.isActive = !category.isActive;
    await category.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          category,
          `Category ${
            category.isActive ? "activated" : "deactivated"
          } successfully`
        )
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});
