// healthCare.controller.js
import HealthcareCenter from "../../models/health/healthCare.model.js";
import HealthCategory from "../../models/health/healthCategory.model.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import handleMongoErrors from "../../utils/mongooseError.js";

// Create Healthcare Center
export const createHealthcareCenter = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      category,
      address,
      pincode,
      contactNumber,
      email,
      specialties,
      isActive,
    } = req.body;

    console.log(req.body);

    // Validation
    if (
      !name ||
      !category ||
      !address ||
      !contactNumber ||
      !email ||
      !specialties
    ) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "All required fields must be filled"));
    }

    // Check if category exists
    const categoryExists = await HealthCategory.findById(category);
    if (!categoryExists) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Health category not found"));
    }

    // Check if healthcare center with email already exists
    const existingHealthcare = await HealthcareCenter.findOne({ email });
    if (existingHealthcare) {
      return res
        .status(409)
        .json(
          new ApiResponse(
            409,
            null,
            "Healthcare center with this email already exists"
          )
        );
    }

    // Create new healthcare center
    const healthcare = new HealthcareCenter({
      name,
      category,
      address,
      pincode,
      contactNumber,
      email,
      specialties: Array.isArray(specialties) ? specialties : [specialties],
      isActive: isActive || false,
    });

    await healthcare.save();
    await healthcare.populate("category", "name description");

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          healthcare,
          "Healthcare center created successfully"
        )
      );
  } catch (error) {
    console.log(error.message);
    return handleMongoErrors(error, res);
  }
});

// Get All Healthcare Centers
export const getAllHealthcareCenters = asyncHandler(async (req, res) => {
  try {
    // Then try with population
    const healthcareCenters = await HealthcareCenter.find()
      .populate("category", "name description")
      .sort({ name: 1 });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          healthcareCenters,
          "Healthcare centers retrieved successfully"
        )
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get Active Healthcare Centers
export const getActiveHealthcareCenters = asyncHandler(async (req, res) => {
  try {
    const healthcareCenters = await HealthcareCenter.find({ isActive: true })
      .populate("category", "name description")
      .sort({ name: 1 });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          healthcareCenters,
          "Active healthcare centers retrieved successfully"
        )
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get Healthcare Center by ID
export const getHealthcareCenterById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const healthcare = await HealthcareCenter.findById(id).populate(
      "category",
      "name description"
    );

    if (!healthcare) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Healthcare center not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          healthcare,
          "Healthcare center retrieved successfully"
        )
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get Healthcare Centers by Category
export const getHealthcareCentersByCategory = asyncHandler(async (req, res) => {
  try {
    const { categoryId } = req.params;

    const healthcareCenters = await HealthcareCenter.find({
      category: categoryId,
      isActive: true,
    })
      .populate("category", "name description")
      .sort({ name: 1 });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          healthcareCenters,
          "Healthcare centers by category retrieved successfully"
        )
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Update Healthcare Center
export const updateHealthcareCenter = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const healthcare = await HealthcareCenter.findById(id);
    if (!healthcare) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Healthcare center not found"));
    }

    // Check if category exists (if being updated)
    if (updateData.category) {
      const categoryExists = await HealthCategory.findById(updateData.category);
      if (!categoryExists) {
        return res
          .status(404)
          .json(new ApiResponse(404, null, "Health category not found"));
      }
    }

    // Check if email already exists (excluding current healthcare center)
    if (updateData.email && updateData.email !== healthcare.email) {
      const existingHealthcare = await HealthcareCenter.findOne({
        email: updateData.email,
      });
      if (existingHealthcare) {
        return res
          .status(409)
          .json(
            new ApiResponse(
              409,
              null,
              "Healthcare center with this email already exists"
            )
          );
      }
    }

    // Update healthcare center
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        if (key === "specialties" && typeof updateData[key] === "string") {
          healthcare[key] = [updateData[key]];
        } else {
          healthcare[key] = updateData[key];
        }
      }
    });

    await healthcare.save();
    await healthcare.populate("category", "name description");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          healthcare,
          "Healthcare center updated successfully"
        )
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Delete Healthcare Center
export const deleteHealthcareCenter = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const healthcare = await HealthcareCenter.findByIdAndDelete(id);
    if (!healthcare) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Healthcare center not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, null, "Healthcare center deleted successfully")
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Search Healthcare Centers
export const searchHealthcareCenters = asyncHandler(async (req, res) => {
  try {
    const { query, category, pincode } = req.query;

    let searchCriteria = { isActive: true };

    if (query) {
      searchCriteria.$or = [
        { name: { $regex: query, $options: "i" } },
        { specialties: { $in: [new RegExp(query, "i")] } },
        { address: { $regex: query, $options: "i" } },
      ];
    }

    if (category) {
      searchCriteria.category = category;
    }

    if (pincode) {
      searchCriteria.pincode = parseInt(pincode);
    }

    const healthcareCenters = await HealthcareCenter.find(searchCriteria)
      .populate("category", "name description")
      .sort({ name: 1 });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          healthcareCenters,
          "Healthcare centers search results"
        )
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get Healthcare Centers by Pincode
export const getHealthcareCentersByPincode = asyncHandler(async (req, res) => {
  try {
    const { pincode } = req.params;

    const healthcareCenters = await HealthcareCenter.find({
      pincode: parseInt(pincode),
      isActive: true,
    })
      .populate("category", "name description")
      .sort({ name: 1 });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          healthcareCenters,
          "Healthcare centers by pincode retrieved successfully"
        )
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});
