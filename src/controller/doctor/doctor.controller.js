import Doctor from "../../models/doctor/doctor.model.js";
import DoctorCategory from "../../models/doctor/doctorCategory.model.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import handleMongoErrors from "../../utils/mongooseError.js";

// Create Doctor
export const createDoctor = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      category,
      healthcareCenters,
      qualification,
      experience,
      specialties,
      services,
      contactNumber,
      email,
      availableDays,
      availableTime,
      location,
      isActive,
    } = req.body;

    // Validation
    if (
      !name ||
      !category ||
      !healthcareCenters ||
      !qualification ||
      !experience ||
      !specialties ||
      !services ||
      !contactNumber ||
      !email ||
      !availableDays ||
      !availableTime ||
      !location
    ) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "All required fields must be filled"));
    }

    // Check if category exists
    const categoryExists = await DoctorCategory.findById(category);
    if (!categoryExists) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Doctor category not found"));
    }

    // Check if doctor with email already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res
        .status(409)
        .json(
          new ApiResponse(409, null, "Doctor with this email already exists")
        );
    }

    // Create new doctor
    const doctor = new Doctor({
      name,
      category,
      healthcareCenters,
      qualification,
      experience,
      specialties,
      services,
      contactNumber,
      email,
      availableDays,
      availableTime,
      location,
      isActive: isActive || false,
    });

    await doctor.save();
    await doctor.populate("category", "name description");

    return res
      .status(201)
      .json(new ApiResponse(201, doctor, "Doctor created successfully"));
  } catch (error) {
    console.log(error)
    return handleMongoErrors(error, res);
  }
});

// Get All Doctors
export const getAllDoctors = asyncHandler(async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate("category", "name description")
      .sort({ name: 1 });

    return res
      .status(200)
      .json(new ApiResponse(200, doctors, "Doctors retrieved successfully"));
  } catch (error) {
    console.log(error)
    return handleMongoErrors(error, res);
  }
});

// Get Active Doctors
export const getActiveDoctors = asyncHandler(async (req, res) => {
  try {
    const doctors = await Doctor.find({ isActive: true })
      .populate("category", "name description")
      .sort({ name: 1 });

    return res
      .status(200)
      .json(
        new ApiResponse(200, doctors, "Active doctors retrieved successfully")
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get Doctor by ID
export const getDoctorById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id).populate(
      "category",
      "name description"
    );
    if (!doctor) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Doctor not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, doctor, "Doctor retrieved successfully"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get Doctors by Category
export const getDoctorsByCategory = asyncHandler(async (req, res) => {
  try {
    const { categoryId } = req.params;

    const doctors = await Doctor.find({ category: categoryId, isActive: true })
      .populate("category", "name description")
      .sort({ name: 1 });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          doctors,
          "Doctors by category retrieved successfully"
        )
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Update Doctor
export const updateDoctor = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Doctor not found"));
    }

    // Check if category exists (if being updated)
    if (updateData.category) {
      const categoryExists = await DoctorCategory.findById(updateData.category);
      if (!categoryExists) {
        return res
          .status(404)
          .json(new ApiResponse(404, null, "Doctor category not found"));
      }
    }

    // Check if email already exists (excluding current doctor)
    if (updateData.email && updateData.email !== doctor.email) {
      const existingDoctor = await Doctor.findOne({ email: updateData.email });
      if (existingDoctor) {
        return res
          .status(409)
          .json(
            new ApiResponse(409, null, "Doctor with this email already exists")
          );
      }
    }

    // Update doctor
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        doctor[key] = updateData[key];
      }
    });

    await doctor.save();
    await doctor.populate("category", "name description");

    return res
      .status(200)
      .json(new ApiResponse(200, doctor, "Doctor updated successfully"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Delete Doctor
export const deleteDoctor = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findByIdAndDelete(id);
    if (!doctor) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Doctor not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Doctor deleted successfully"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Search Doctors
export const searchDoctors = asyncHandler(async (req, res) => {
  try {
    const { query, category, location } = req.query;

    let searchCriteria = { isActive: true };

    if (query) {
      searchCriteria.$or = [
        { name: { $regex: query, $options: "i" } },
        { qualification: { $regex: query, $options: "i" } },
        { specialties: { $in: [new RegExp(query, "i")] } },
      ];
    }

    if (category) {
      searchCriteria.category = category;
    }

    if (location) {
      searchCriteria.location = { $regex: location, $options: "i" };
    }

    const doctors = await Doctor.find(searchCriteria)
      .populate("category", "name description")
      .sort({ name: 1 });

    return res
      .status(200)
      .json(new ApiResponse(200, doctors, "Doctors search results"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});
