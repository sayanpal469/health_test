import HealthcareCenter from "../../models/health/healthCare.model.js";
import HealthCategory from "../../models/health/healthCategory.model.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import handleMongoErrors from "../../utils/mongooseError.js";

// Create Health Category
export const createHealthCategory = asyncHandler(async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    // Validation
    if (!name) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Category name is required"));
    }

    // Check if category already exists
    const existingCategory = await HealthCategory.findOne({ name });
    if (existingCategory) {
      return res
        .status(409)
        .json(new ApiResponse(409, null, "Health category already exists"));
    }

    // Create new category
    const category = new HealthCategory({
      name,
      description: description || "",
      isActive: isActive || false,
    });

    await category.save();

    return res
      .status(201)
      .json(
        new ApiResponse(201, category, "Health category created successfully")
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get All Health Categories
export const getAllHealthCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await HealthCategory.find().sort({ name: 1 });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          categories,
          "Health categories retrieved successfully"
        )
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get Active Health Categories
export const getActiveHealthCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await HealthCategory.find({ isActive: true }).sort({
      name: 1,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          categories,
          "Active health categories retrieved successfully"
        )
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get Health Category by ID
export const getHealthCategoryById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const category = await HealthCategory.findById(id);
    if (!category) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Health category not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, category, "Health category retrieved successfully")
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Update Health Category
export const updateHealthCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const category = await HealthCategory.findById(id);
    if (!category) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Health category not found"));
    }

    // Check if name already exists (excluding current category)
    if (name && name !== category.name) {
      const existingCategory = await HealthCategory.findOne({ name });
      if (existingCategory) {
        return res
          .status(409)
          .json(
            new ApiResponse(409, null, "Health category name already exists")
          );
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
        new ApiResponse(200, category, "Health category updated successfully")
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Delete Health Category
export const deleteHealthCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

  
    const healthcareCount = await HealthcareCenter.countDocuments({
      category: id,
    });

    if (healthcareCount > 0) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            "Cannot delete category. Healthcare centers are using this category."
          )
        );
    }

    const category = await HealthCategory.findByIdAndDelete(id);
    if (!category) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Health category not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Health category deleted successfully"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});
